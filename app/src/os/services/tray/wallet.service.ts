import { ipcMain, ipcRenderer } from 'electron';
import { ethers, utils, Wallet } from 'ethers';
import Store from 'electron-store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { WalletApi } from '../../api/min-wallet';

import Realm from '../..';
import { BaseService } from '../base.service';
import {
  WalletStore,
  WalletStoreType,
  WalletView,
  NetworkType,
} from './wallet.model';
import { getEntityHashesFromLabelsBackward } from '@cliqz/adblocker/dist/types/src/request';
import EncryptedStore from '../../lib/encryptedStore';
import { Network, Alchemy } from "alchemy-sdk";
import { T } from 'lodash/fp';

const alchemySettings = {
  apiKey: "gaAFkc10EtqPwZDCXAvMni8xgz9JnNmM", // Replace with your Alchemy API Key.
  network: Network.ETH_GOERLI, // Replace with your network.
};

const alchemy = new Alchemy(alchemySettings);

export interface RecipientPayload {
  recipientMetadata?: {
    color?: string;
    avatar?: string;
    nickname?: string;
  };
  patp: string;
  address?: string | null;
  gasEstimate?: number;
}

export class WalletService extends BaseService {
  private db?: Store<WalletStoreType> | EncryptedStore<WalletStoreType>; // for persistence
  private state?: WalletStoreType; // for state management
  private ethProvider?: ethers.providers.JsonRpcProvider;
  handlers = {
    'realm.tray.wallet.set-mnemonic': this.setMnemonic,
    'realm.tray.wallet.set-view': this.setView,
    'realm.tray.wallet.set-return-view': this.setReturnView,
    'realm.tray.wallet.set-network': this.setNetwork,
    'realm.tray.wallet.get-recipient': this.getRecipient,
    'realm.tray.wallet.save-transaction-notes': this.saveTransactionNotes,
    'realm.tray.wallet.set-xpub': this.setXpub,
    'realm.tray.wallet.set-wallet-creation-mode': this.setWalletCreationMode,
    'realm.tray.wallet.set-sharing-mode': this.setSharingMode,
    'realm.tray.wallet.set-sharing-permissions': this.setSharingPermissions,
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
      return ipcRenderer.invoke(
        'realm.tray.wallet.set-mnemonic',
        mnemonic,
        passcodeHash
      );
    },
    setView: (view: WalletView, index?: string, currentItem?: { type: 'transaction' | 'nft' | 'coin', key: string }) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.set-view',
        view,
        index,
        currentItem
      );
    },
    setReturnView: (view: WalletView) => {
      return ipcRenderer.invoke('realm.tray.wallet.set-return-view', view);
    },
    setNetwork: (network: NetworkType) => {
      return ipcRenderer.invoke('realm.tray.wallet.set-network', network);
    },
    getRecipient: (patp: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.get-recipient', patp);
    },
    saveTransactionNotes: (notes: string) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.save-transaction-notes',
        notes
      );
    },
    setXpub: () => {
      return ipcRenderer.invoke('realm.tray.wallet.set-xpub');
    },
    setWalletCreationMode: (mode: string) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.set-wallet-creation-mode',
        mode
      );
    },
    setSharingMode: (who: string) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.set-sharing-mode',
        who
      )
    },
    setSharingPermissions: (type: string, who: string) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.set-sharing-mode',
        type,
        who
      )
    },
    changeDefaultWallet: (network: string, index: number) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.change-default-wallet',
        network,
        index
      );
    },
    setNetworkProvider: (network: string, provider: string) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.set-network-provider',
        network,
        provider
      );
    },
    createWallet: (nickname: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.create-wallet', nickname);
    },
    sendEthereumTransaction: (
      walletIndex: string,
      to: string,
      amount: string,
      toPatp?: string,
      contractType?: string,
    ) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.send-ethereum-transaction',
        walletIndex,
        to,
        amount,
        toPatp,
        contractType
      );
    },
    sendBitcoinTransaction: (
      walletIndex: number,
      to: string,
      amount: string
    ) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.send-bitcoin-transaction',
        walletIndex,
        to,
        amount
      );
    },
    addSmartContract: (
      contractId: string,
      contractType: string,
      name: string,
      contractAddress: string,
      walletIndex: string
    ) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.add-smart-contract',
        contractId,
        contractType,
        name,
        contractAddress,
        walletIndex
      );
    },
    requestAddress: (from: string, network: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.request-address');
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  private getPrivateKey() {
    return ethers.utils.HDNode.fromMnemonic(
      this.core.services.identity.auth.getMnemonic(null)
    );
  }

  async onLogin(ship: string) {
    let secretKey: string | null = this.core.passwords.getPassword(ship)!;
    const storeParams = {
      name: 'wallet',
      cwd: `realm.${ship}`,
      secretKey,
      accessPropertiesByDotNotation: true,
    };
    this.db =
      process.env.NODE_ENV === 'development'
        ? new Store<WalletStoreType>(storeParams)
        : new EncryptedStore<WalletStoreType>(storeParams);

    let persistedState: WalletStoreType = this.db.store;

    if (Object.keys(persistedState).length !== 0) {
      this.state = WalletStore.create(castToSnapshot(persistedState));
    } else {
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
          },
        },
        creationMode: 'default',
        sharingMode: 'anybody',
        ourPatp: ship,
      });
    }

    onSnapshot(this.state, (snapshot: any) => {
      this.db!.store = snapshot;
    });

    this.ethProvider = new ethers.providers.JsonRpcProvider(
      //'https://goerli.infura.io/v3/db4a24fe02d9423db89e8de8809d6fff'
      'http://127.0.0.1:8545'
    );

    const patchEffect = {
      model: getSnapshot(this.state),
      resource: 'wallet',
      response: 'initial',
    };
    this.core.onEffect(patchEffect);

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'wallet',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });

    WalletApi.subscribeToWallets(this.core.conduit!, async (wallet: any) => {
      if (wallet.network === 'ethereum') {
        this.state!.ethereum.applyWalletUpdate(wallet);
        const balances = await alchemy.core.getTokenBalances(wallet.address);
        // Remove tokens with zero balance
        const nonZeroBalances = balances.tokenBalances.filter((token: any) => {
          return token.tokenBalance !== "0";
        });
        for (let token of nonZeroBalances) {
          if (!this.state!.ethereum.wallets.get(wallet.key)!.coins.has((token as any).contractAddress)) {
            const metadata = await alchemy.core.getTokenMetadata((token as any).contractAddress);
            this.state!.ethereum.wallets.get(wallet.key)!.addSmartContract('erc20', metadata.symbol!, (token as any).contractAddress, metadata.decimals!)
            WalletApi.addSmartContract(this.core.conduit!, 'erc20', metadata.symbol!, (token as any).contractAddress, wallet.key);
          }
        }
        const nfts = await alchemy.nft.getNftsForOwner(wallet.address);
        for (let nft of nfts.ownedNfts) {
          if (!this.state!.ethereum.wallets.get(wallet.key)!.nfts.has((nft as any).contract.address + nft.tokenId)) {
            console.log(nft.title)
            console.log(nft.description)
            // const price = await alchemy.nft.getFloorPrice(nft.contract.address)
            var floorPrice
            this.state!.ethereum.wallets.get(wallet.key)!.addNFT(nft.description, nft.description, nft.contract.address, nft.tokenId, nft.rawMetadata!.image!, floorPrice);
          }
        }
      }
      if (wallet.network === 'bitcoin') {
        this.state!.bitcoin.applyWalletUpdate(wallet);
      }
    });
    WalletApi.getWallets(this.core.conduit!).then((wallets: any) => {
      this.state!.ethereum.initial(wallets);
      this.state!.bitcoin.initial(wallets);
    });
    WalletApi.subscribeToTransactions(
      this.core.conduit!,
      (transaction: any) => {
        if (transaction.network == 'ethereum')
          this.state!.ethereum.applyTransactionUpdate(transaction);
        //      else if (transaction.network == 'bitcoin')
        //        this.state!.bitcoin.applyTransactionUpdate(transaction);
        const tx = this.state!.ethereum.transactions.get(
          transaction.transaction.hash
        );
      }
    );

    WalletApi.getHistory(this.core.conduit!).then((history: any) => {
      this.state!.ethereum.applyHistory(history);
    });

    this.setNetworkProvider(
      'realm.tray.wallet.set-network-provider',
      'ethereum',
 //     'https://goerli.infura.io/v3/db4a24fe02d9423db89e8de8809d6fff'
      'http://127.0.0.1:8545'
    );
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async setMnemonic(_event: any, mnemonic: string, passcodeHash: string) {
    this.state!.setPasscodeHash(passcodeHash);
    this.core.services.identity.auth.setMnemonic(
      'realm.auth.set-mnemonic',
      mnemonic
    );
    const privateKey = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const ethPath = "m/44'/60'/0'/0";
    const btcPath = "m/44'/0'/0'/0";
    let xpub: string = privateKey.derivePath(ethPath).neuter().extendedKey;
    // eth

    console.log('setting eth xpub');
    await WalletApi.setXpub(this.core.conduit!, 'ethereum', xpub);
    // btc
    console.log('setting btc xpub');
    xpub = privateKey.derivePath(btcPath).neuter().extendedKey;
    await WalletApi.setXpub(this.core.conduit!, 'bitcoin', xpub);

    console.log('okay transitioning');
    this.state!.setView(WalletView.ETH_LIST);
  }

  async setXpub(_event: any) {
    const ethPath = "m/44'/60'/0'/0";
    const btcPath = "m/44'/0'/0'/0";
    const privateKey = this.getPrivateKey();
    let xpub: string = privateKey.derivePath(ethPath).neuter().extendedKey;
    // eth
    await WalletApi.setXpub(this.core.conduit!, 'ethereum', xpub);
    // btc
    xpub = privateKey.derivePath(btcPath).neuter().extendedKey;
    await WalletApi.setXpub(this.core.conduit!, 'bitcoin', xpub);
  }

  async setView(
    _event: any,
    view: WalletView,
    index?: string,
    currentItem?: { type: 'transaction' | 'nft' | 'coin', key: string }
  ) {
    console.log(`service setting view: ${view}`);
    this.state!.setView(view, index, currentItem);
  }

  async setReturnView(_event: any, view: WalletView) {
    this.state!.setReturnView(view);
  }

  async setNetwork(_event: any, network: NetworkType) {
    this.state!.setNetwork(network);
  }

  async getRecipient(_event: any, patp: string): Promise<RecipientPayload> {
    console.log('hey from get rec');
    // TODO: fetch contact metadata (profile pic)
    let recipientMetadata: {
      color?: string;
      avatar?: string;
      nickname?: string;
    } = await this.core.services.ship.getContact(null, patp);

    console.log('metadata fetched:');
    console.log(recipientMetadata);

    // let dummy: ethers.Wallet = ethers.Wallet.createRandom();
    // let tx = {
    //   to: dummy,
    //   value: ethers.utils.parseEther("1.0"),
    // }
    // //@ts-ignore
    // const gasEstimate: number = await this.ethProvider!.estimateGas(tx);
    // console.log(`got gas estimate: ${gasEstimate}`);

    try {
      console.log('requesting address');
      const address: any = await WalletApi.getAddress(
        this.core.conduit!,
        this.state!.network,
        patp
      );
      console.log(address);
      console.log(`got address! ${address}`);

      return {
        patp,
        recipientMetadata: recipientMetadata,
        address: address ? address.address : null,
        gasEstimate: 7,
      };
    } catch (e) {
      console.log('damn');
      console.error(e);
      return {
        patp,
        gasEstimate: 7,
        recipientMetadata: {},
        address: null,
      };
    }
  }

  async saveTransactionNotes(_event: any, notes: string) {
    const network = this.state!.network;
    const hash = this.state!.currentTransaction!;
    WalletApi.saveTransactionNotes(this.core.conduit!, network, hash, notes);
  }

  async getCurrentExchangeRate(_event: any, network: NetworkType) {
    // doesn't the agent have a way of getting this if you're setting the USD equivalent every so often?
    // is probably cleaner to pull from here than add some random npm lib to do it
  }

  async setWalletCreationMode(_event: any, mode: string) {
    this.state!.creationMode = mode;
    await WalletApi.setWalletCreationMode(this.core.conduit!, mode);
  }

  async setSharingMode(_event: any, who: string) {
    this.state!.sharingMode = who;
    await WalletApi.setSharingMode(this.core.conduit!, who);
  }

  async setSharingPermissions(_event: any, type: string, who: string) {
    this.state!.setSharingPermissions(type, who);
    await WalletApi.setSharingPermissions(this.core.conduit!, type, who);
  }

  async changeDefaultWallet(_event: any, network: string, index: number) {
    if (network == 'ethereum')
      this.state!.ethereum.settings.defaultIndex = index;
    else if (network == 'bitcoin')
      this.state!.bitcoin.settings.defaultIndex = index;
    await WalletApi.changeDefaultWallet(this.core.conduit!, network, index);
  }

  async setNetworkProvider(_event: any, network: string, provider: string) {
    if (network == 'ethereum') this.state!.ethereum.setProvider(provider);
    else if (network == 'bitcoin') this.state!.bitcoin.setProvider(provider);
    // await WalletApi.setNetworkProvider(this.core.conduit!, network, provider);
  }

  async createWallet(_event: any, nickname: string) {
    console.log(`creating with nickname: ${nickname}`);
    const sender: string = this.state!.ourPatp!;
    const network: string = this.state!.network;
    await WalletApi.createWallet(this.core.conduit!, sender, network, nickname);
    this.state!.setView(WalletView.ETH_LIST);
  }

  async estimateCurrentGasFee(_event: any) {}

  async sendEthereumTransaction(
    _event: any,
    walletIndex: string,
    to: string,
    amount: string,
    toPatp?: string,
    contractType?: string,
  ) {
    console.log(walletIndex);
    console.log(to);
    console.log(amount);
    console.log(toPatp);
    const path = "m/44'/60'/0'/0/0" + walletIndex;
    console.log(path);
    // console.log(this.privateKey!.mnemonic!.phrase);
    const privateKey = this.getPrivateKey();
    const wallet = new ethers.Wallet(privateKey.derivePath(path).privateKey);
    let signer = wallet.connect(this.ethProvider!);
    console.log(amount);
    let tx = {
      to: to,
      value: ethers.utils.parseEther(amount),
    };
    const { hash } = await signer.sendTransaction(tx);
    console.log('hash: ' + hash);
    const fromAddress = this.state!.ethereum.wallets.get(
      this.state!.currentIndex!
    )!.address;
    this.state!.ethereum.enqueueTransaction(
      hash,
      tx.to,
      toPatp,
      fromAddress,
      tx.value,
      new Date().toISOString(),
      contractType,
    );
    const stateTx = this.state!.ethereum.getTransaction(hash);
    console.log(stateTx);
    await WalletApi.enqueueTransaction(
      this.core.conduit!,
      'ethereum',
      'gorli',
      hash,
      stateTx,
      contractType,
    );
  }

  async sendBitcoinTransaction(
    _event: any,
    walletIndex: string,
    to: string,
    amount: string
  ) {
    let sourceAddress = this.state!.bitcoin.wallets.get(walletIndex)!.address;
    const privateKeyNode = this.getPrivateKey();
    const privateKey = privateKeyNode.derivePath(
      "m/44'/0'/0'/0" + walletIndex
    ).privateKey;
    // let tx, hash = sendBitcoin(sourceAddress, to, amount, privateKey)
    // await WalletApi.enqueueTransaction(this.core.conduit!, 'ethereum', tx, hash);
  }

  async addSmartContract(
    _event: any,
    contractId: string,
    contractType: string,
    name: string,
    contractAddress: string,
    walletIndex: string,
    decimals: number
  ) {
    this.state!.ethereum.wallets.get(walletIndex)!.addSmartContract(contractType, name, contractAddress, decimals);
    await WalletApi.addSmartContract(
      this.core.conduit!,
      contractType,
      name,
      contractAddress,
      walletIndex,
    );
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
