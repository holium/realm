import { ipcMain, ipcRenderer } from 'electron';
import { ethers, utils, Wallet } from 'ethers';
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
} from './wallet.model';
import bitcore from 'bitcore-lib';
import { getEntityHashesFromLabelsBackward } from '@cliqz/adblocker/dist/types/src/request';
import { HDNode } from 'ethers/lib/utils';

export class WalletService extends BaseService {
  private state?: WalletStoreType; // for state management
  private privateKey: ethers.utils.HDNode;
  private ethProvider: ethers.providers.JsonRpcProvider;
  handlers = {
    'realm.tray.wallet.set-xpub': this.setXpub,
    'realm.tray.wallet.set-wallet-creation-mode': this.setWalletCreationMode,
    'realm.tray.wallet.change-default-wallet': this.changeDefaultWallet,
    'realm.tray.wallet.create-wallet': this.createWallet,
    'realm.tray.wallet.send-ethereum-transaction': this.sendEthereumTransaction,
    'realm.tray.wallet.send-bitcoin-transaction': this.sendBitcoinTransaction,
    'realm.tray.wallet.add-erc20': this.addERC20,
    'realm.tray.wallet.add-erc721': this.addERC721,
  };

  static preload = {
    setXpub: (network: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.set-xpub', network);
    },
    setWalletCreationMode: () => {
      return ipcRenderer.invoke('realm.tray.wallet.set-wallet-creation-mode');
    },
    changeDefaultWallet: () => {
      return ipcRenderer.invoke('realm.tray.wallet.change-default-wallet');
    },
    createWallet: (sender: string, network: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.create-wallet', sender, network);
    },
    sendEthereumTransaction: () => {
      return ipcRenderer.invoke('realm.tray.wallet.send-ethereum-transaction')
    },
    sendBitcoinTransaction: () => {
      return ipcRenderer.invoke('realm.tray.wallet.send-bitcoin-transaction')
    },
    addERC20: () => {
      return ipcRenderer.invoke('realm.tray.wallet.add-erc20')
    },
    addERC721: () => {
      return ipcRenderer.invoke('realm.tray.wallet.add-erc721')
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    // this.core.conduit!.desk = 'realm';
    const mnemonic = 'carry poem leisure coffee issue urban save evolve catch hammer simple unknown';
    this.privateKey = ethers.utils.HDNode.fromMnemonic(mnemonic);

    this.ethProvider = new ethers.providers.JsonRpcProvider(
      'http://localhost:8545'
    );

    this.state = WalletStore.create({
        network: 'ethereum',
        currentView: 'ethereum:list',
        ethereum: {},
        bitcoin: {}
    });

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

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });


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
      console.log(transaction);
    });
    WalletApi.getHistory(this.core.conduit!).then((history: any) => {
      console.log(history);
    });
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async setXpub(_event: any, network: string) {
    let path: string = '';
    if (network == 'ethereum') {
      path = "m/44'/60'/0'/0";
    }
    else if (network == 'bitcoin') {
      path = "m/44'/0'/0'/0";
    }
    let xpub: string = this.privateKey.derivePath(path).neuter().extendedKey;
    await WalletApi.setXpub(this.core.conduit!, network, xpub);
  }

  async setWalletCreationMode(_event: any, mode: string) {
    await WalletApi.setWalletCreationMode(this.core.conduit!, mode);
  }

  async changeDefaultWallet(_event: any, network: string, index: number) {
    await WalletApi.changeDefaultWallet(this.core.conduit!, network, index);
  }

  async createWallet(_event: any, sender: string, network: string) {
    await WalletApi.createWallet(this.core.conduit!, sender, network);
  }

  async sendEthereumTransaction(_event: any, walletIndex: number, to: string, amount: string) {
    let tx = {
      to: to,
      value: ethers.utils.parseEther(amount),
    }
    const wallet = new ethers.Wallet(this.privateKey.derivePath("m/44'/60'/0'/0/" + walletIndex).privateKey);
    wallet.connect(this.ethProvider);
    const { hash } = await wallet.sendTransaction(tx);
    await WalletApi.enqueueTransaction(this.core.conduit!, 'ethereum', tx, hash);
  }

  async sendBitcoinTransaction(_event: any, walletIndex: string, to: string, amount: string) {
    let sourceAddress = this.state!.bitcoin.wallets.get(walletIndex)!.address;
    let privateKey = this.privateKey.derivePath("m/44'/0'/0'/0" + walletIndex).privateKey;
    // let tx, hash = sendBitcoin(sourceAddress, to, amount, privateKey)
    // await WalletApi.enqueueTransaction(this.core.conduit!, 'ethereum', tx, hash);
  }

  async addERC20(_event: any, contractId: string, name: string, contractAddress: string, walletIndex: string) {
    await WalletApi.addSmartContact(this.core.conduit!, contractId, 'erc20', name, contractAddress, walletIndex);
  }

  async addERC721(_event: any, contractId: string, name: string, contractAddress: string, walletIndex: string) {
    await WalletApi.addSmartContact(this.core.conduit!, contractId, 'erc721', name, contractAddress, walletIndex);
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