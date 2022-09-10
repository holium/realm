import { ipcMain, ipcRenderer } from 'electron';
import { ethers, utils, Wallet } from 'ethers';
import Store from 'electron-store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { WalletApi } from '../../api/wallet';

import Realm from '../..';
import { BaseService } from '../base.service';
import {
  WalletStore,
  WalletStoreType,
  WalletView,
  NetworkType,
} from './wallet.model';
import { getEntityHashesFromLabelsBackward } from '@cliqz/adblocker/dist/types/src/request';
import { HDNode } from 'ethers/lib/utils';

interface RecipientPayload {
  recipientMetadata: {
    color?: string,
    avatar?: string,
    nickname?: string
  }
  address: string | null
  gasEstimate: number,
  exchangeRate: {
    coinToUsdMultiplier: number,
    usdToCoinMultiplier: number
  }
}

export class WalletService extends BaseService {
  private db?: Store<WalletStoreType>; // for persistence
  private state?: WalletStoreType; // for state management
  private privateKey?: ethers.utils.HDNode;
  private ethProvider?: ethers.providers.JsonRpcProvider;
  handlers = {
    'realm.tray.wallet.set-mnemonic': this.setMnemonic,
    'realm.tray.wallet.set-view': this.setView,
    'realm.tray.wallet.set-network': this.setNetwork,
    'realm.tray.wallet.set-xpub': this.setXpub,
    'realm.tray.wallet.set-wallet-creation-mode': this.setWalletCreationMode,
    'realm.tray.wallet.change-default-wallet': this.changeDefaultWallet,
    'realm.tray.wallet.set-network-provider': this.setNetworkProvider,
    'realm.tray.wallet.create-wallet': this.createWallet,
    'realm.tray.wallet.send-ethereum-transaction': this.sendEthereumTransaction,
    'realm.tray.wallet.send-bitcoin-transaction': this.sendBitcoinTransaction,
    'realm.tray.wallet.add-smart-contract': this.addSmartContract,
    'realm.tray.wallet.request-address': this.requestAddress,
  };

  static preload = {
    setMnemonic: (mnemonic: string, passcodeHash: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.set-mnemonic', mnemonic, passcodeHash)
    },
    setView: (view: WalletView, address?: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.set-view', view, address);
    },
    setNetwork: (network: NetworkType) => {
      return ipcRenderer.invoke('realm.tray.wallet.set-network', network);
    },
    setXpub: () => {
      return ipcRenderer.invoke('realm.tray.wallet.set-xpub');
    },
    setWalletCreationMode: (mode: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.set-wallet-creation-mode', mode);
    },
    changeDefaultWallet: (network: string, index: number) => {
      return ipcRenderer.invoke('realm.tray.wallet.change-default-wallet', network, index);
    },
    setNetworkProvider: (network: string, provider: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.set-network-provider', network, provider);
    },
    createWallet: (nickname: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.create-wallet', nickname);
    },
    sendEthereumTransaction: (walletIndex: number, to: string, amount: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.send-ethereum-transaction', walletIndex, to, amount)
    },
    sendBitcoinTransaction: (walletIndex: number, to: string, amount: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.send-bitcoin-transaction', walletIndex, to, amount)
    },
    addSmartContract: (contractId: string, contractType: string, name: string, contractAddress: string, walletIndex: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.add-smart-contract', contractId, contractType, name, contractAddress, walletIndex);
    },
    requestAddress: (from: string, network: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.request-address');
    }
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  async onLogin(ship: string) {
    this.db = new Store({
      name: 'wallet',
      cwd: `realm.wallet`, // base folder
      accessPropertiesByDotNotation: true,
    });

    let persistedState: WalletStoreType = this.db.store;

    if (Object.keys(persistedState).length !== 0) {
      this.state = WalletStore.create(castToSnapshot(persistedState))
    }
    else {
      this.state = WalletStore.create({
          network: 'ethereum',
          currentView: 'ethereum:new',
          ethereum: {
            settings: {
              defaultIndex: 0,
            },
            initialized: false,
          },
          bitcoin: {
            settings: {
              defaultIndex: 0,
            }
          },
          creationMode: 'default',
          ourPatp: ship,
      });
    }

    this.ethProvider = new ethers.providers.JsonRpcProvider(
      'http://localhost:8545'
    );

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'wallet',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });

    const patchEffect = {
      model: getSnapshot(this.state),
      resource: 'wallet',
      response: 'initial',
    };
    this.core.onEffect(patchEffect);

    WalletApi.subscribeToAddresses(this.core.conduit!, (address: any) => {
      console.log(address);
    })
    WalletApi.subscribeToWallets(this.core.conduit!, (wallet: any) => {
      if (wallet.network === 'ethereum') {
        this.state!.ethereum.applyWalletUpdate(wallet);
      }
      if (wallet.network === 'bitcoin') {
        this.state!.bitcoin.applyWalletUpdate(wallet);
      }
    })
    WalletApi.getWallets(this.core.conduit!).then((wallets: any) => {
      this.state!.ethereum.initial(wallets);
      this.state!.bitcoin.initial(wallets);
    });
    WalletApi.subscribeToTransactions(this.core.conduit!, (transaction: any) => {
      if (transaction.network == 'ethereum')
        this.state!.ethereum.applyTransactionUpdate(transaction)
//      else if (transaction.network == 'bitcoin')
//        this.state!.bitcoin.applyTransactionUpdate(transaction);
    });
    WalletApi.getHistory(this.core.conduit!).then((history: any) => {
      this.state!.ethereum.applyHistory(history);
    });

    this.setNetworkProvider('realm.tray.wallet.set-network-provider', 'ethereum', 'http://127.0.0.1:8545');

  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async setMnemonic(_event: any, mnemonic: string, passcodeHash: string) {
    this.state!.setPasscodeHash(passcodeHash);
    this.privateKey = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const ethPath = "m/44'/60'/0'/0";
    const btcPath = "m/44'/0'/0'/0";
    let xpub: string = this.privateKey!.derivePath(ethPath).neuter().extendedKey;
    // eth

    console.log('setting eth xpub')
    await WalletApi.setXpub(this.core.conduit!, 'ethereum', xpub);
    // btc
    console.log('setting btc xpub')
    xpub = this.privateKey!.derivePath(btcPath).neuter().extendedKey;
    await WalletApi.setXpub(this.core.conduit!, 'bitcoin', xpub);

    console.log('okay transitioning')
    this.state!.setView(WalletView.ETH_LIST);
  }

  async setXpub(_event: any) {
    const ethPath = "m/44'/60'/0'/0";
    const btcPath = "m/44'/0'/0'/0";
    let xpub: string = this.privateKey!.derivePath(ethPath).neuter().extendedKey;
    // eth
    await WalletApi.setXpub(this.core.conduit!, 'ethereum', xpub);
    // btc
    xpub = this.privateKey!.derivePath(btcPath).neuter().extendedKey;
    await WalletApi.setXpub(this.core.conduit!, 'bitcoin', xpub);
  }

  async setView(_event: any, view: WalletView, address: string) {
    this.state!.setView(view, address);
  }

  async setNetwork(_event: any, network: NetworkType) {
    this.state!.setNetwork(network);
  }

  async getRecipient(_event: any, patp: string): Promise<RecipientPayload> {
    // TODO: fetch contact metadata (profile pic)
    let recipientMetadata: {
      color?: string,
      avatar?: string,
      nickname?: string
    } = await this.core.services.ship.getContact(null, patp);

    // LEO: this is where we need to poke the agent and determine if we can
    // get an address for this patp and return it if we can
  }

  async getCurrentExchangeRate(_event: any, network: NetworkType) {
    // doesn't the agent have a way of getting this if you're setting the USD equivalent every so often?
    // is probably cleaner to pull from here than add some random npm lib to do it
  }

  async setWalletCreationMode(_event: any, mode: string) {
    this.state!.creationMode = mode;
    await WalletApi.setWalletCreationMode(this.core.conduit!, mode);
  }

  async changeDefaultWallet(_event: any, network: string, index: number) {
    if (network == 'ethereum')
      this.state!.ethereum.settings.defaultIndex = index;
    else if (network == 'bitcoin')
      this.state!.bitcoin.settings.defaultIndex = index;
    await WalletApi.changeDefaultWallet(this.core.conduit!, network, index);
  }

  async setNetworkProvider(_event: any, network: string, provider: string) {
    if (network == 'ethereum')
      this.state!.ethereum.setProvider(provider);
    else if (network == 'bitcoin')
      this.state!.bitcoin.setProvider(provider);
    await WalletApi.setNetworkProvider(this.core.conduit!, network, provider);
  }

  async createWallet(_event: any, nickname: string) {
    console.log(`creating with nickname: ${nickname}`)
    const sender: string = this.state!.ourPatp!;
    const network: string = this.state!.network;
    await WalletApi.createWallet(this.core.conduit!, sender, network, nickname);
    this.state!.setView(WalletView.ETH_LIST);
  }

  async sendEthereumTransaction(_event: any, walletIndex: number, to: string, amount: string) {
    let tx = {
      to: to,
      value: ethers.utils.parseEther(amount),
    }
    const wallet = new ethers.Wallet(this.privateKey!.derivePath("m/44'/60'/0'/0/" + walletIndex).privateKey);
    wallet.connect(this.ethProvider!);
    const { hash } = await wallet.sendTransaction(tx);
    this.state!.ethereum.enqueueTransaction(tx);
    await WalletApi.enqueueTransaction(this.core.conduit!, 'ethereum', tx, hash);
  }

  async sendBitcoinTransaction(_event: any, walletIndex: string, to: string, amount: string) {
    let sourceAddress = this.state!.bitcoin.wallets.get(walletIndex)!.address;
    let privateKey = this.privateKey!.derivePath("m/44'/0'/0'/0" + walletIndex).privateKey;
    // let tx, hash = sendBitcoin(sourceAddress, to, amount, privateKey)
    // await WalletApi.enqueueTransaction(this.core.conduit!, 'ethereum', tx, hash);
  }

  async addSmartContract(_event: any, contractId: string, contractType: string, name: string, contractAddress: string, walletIndex: string) {
    await WalletApi.addSmartContact(this.core.conduit!, contractId, contractType, name, contractAddress, walletIndex);
  }

  async requestAddress(_event: any, network: string, from: string) {
    await WalletApi.requestAddress(this.core.conduit!, network, from);
  }

  /*
  private async sendBitcoin(senderPath: string, receiverAddress: string, amountToSend: number) {
    const sochain_network = "BTCTEST";
    const privateKey = this.privateKey.derivePath(senderPath).privateKey;
    const sourceAddress = this.privateKey.derivePath(senderPath).address;
    const satoshiToSend = amountToSend * 100000000;
    let fee = 0;
    let inputCount = 0;
    let outputCount = 2;
    const utxos = await axios.get(
      `https://sochain.com/api/v2/get_tx_unspent/${sochain_network}/${sourceAddress}`
    );
    const transaction = new bitcore.Transaction();
    let totalAmountAvailable = 0;
    let inputs : any = [];
    utxos.data.data.txs.forEach(async (element: any) => {
      let utxo: any = {};
      utxo.satoshis = Math.floor(Number(element.value) * 100000000);
      utxo.script = element.script_hex;
      utxo.address = utxos.data.data.address;
      utxo.txId = element.txid;
      utxo.outputIndex = element.output_no;
      totalAmountAvailable += utxo.satoshis;
      inputCount += 1;
      inputs.push(utxo);
    });
    let transactionSize: number = inputCount * 146 + outputCount * 34 + 10 - inputCount;
    fee = transactionSize * 20
    if (totalAmountAvailable - satoshiToSend - fee  < 0) {
      throw new Error("Balance is too low for this transaction");
    }
    transaction.from(inputs);
    transaction.to(receiverAddress, satoshiToSend);
    transaction.change(sourceAddress);
    transaction.fee(fee * 20);
    transaction.sign(privateKey);
    const serializedTransaction = transaction.serialize();
    const result = await axios({
      method: "POST",
      url: `https://sochain.com/api/v2/send_tx/${sochain_network}`,
      data: {
        tx_hex: serializedTransaction,
      },
    });
    return result.data.data;
  };*/

}
