import { ipcMain, ipcRenderer } from 'electron';
import { BaseService } from '../base.service';
import { WalletStoreType } from './wallet.model';
import Store from 'electron-store';
import EncryptedStore from '../../lib/encryptedStore';
import Realm from '../..';
import {
  WalletStore,
  WalletStoreType,
  WalletView,
  NetworkType,
  WalletCreationMode,
  SharingMode,
  UISettingsType,
  EthWalletType,
  SettingsType,
} from './wallet.model';
import { BaseSigner } from '@holium/realm-wallet/src/wallets/BaseSigner';
import { RealmSigner } from './wallet/signers/realm';
import { WalletApi } from 'os/api/wallet';

// 10 minutes
const AUTO_LOCK_INTERVAL = 1000 * 60 * 10;

export class WalletService extends BaseService {
  private db?: Store<WalletStoreType> | EncryptedStore<WalletStoreType>; // for persistence
  private state?: WalletStoreType; // for state management
  private signer?: BaseSigner;
  handlers = {
    'realm.tray.wallet.set-mnemonic': this.setMnemonic,
    'realm.tray.wallet.set-network': this.setNetwork,
    'realm.tray.wallet.get-recipient': this.getRecipient,
    'realm.tray.wallet.save-transaction-notes': this.saveTransactionNotes,
    'realm.tray.wallet.set-settings': this.setSettings,
    'realm.tray.wallet.change-default-wallet': this.changeDefaultWallet,
    'realm.tray.wallet.set-network-provider': this.setNetworkProvider,
    'realm.tray.wallet.create-wallet': this.createWallet,
    'realm.tray.wallet.send-ethereum-transaction': this.sendEthereumTransaction,
    'realm.tray.wallet.send-erc20-transaction': this.sendERC20Transaction,
    'realm.tray.wallet.send-erc721-transaction': this.sendERC721Transaction,
    'realm.tray.wallet.send-bitcoin-transaction': this.sendBitcoinTransaction,
    'realm.tray.wallet.request-address': this.requestAddress,
    'realm.tray.wallet.check-passcode': this.checkPasscode,
    'realm.tray.wallet.check-provider-url': this.checkProviderUrl,
    'realm.tray.wallet.set-network-protocol': this.setNetworkProtocol,
    'realm.tray.wallet.check-mnemonic': this.checkMnemonic,
    'realm.tray.wallet.navigate': this.navigate,
    'realm.tray.wallet.navigateBack': this.navigateBack,
    'realm.wallet.get-coin-txns': this.getCoinTxns,
  };

  static preload = {
    setMnemonic: async (mnemonic: string, passcode: number[]) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.set-mnemonic',
        mnemonic,
        passcode
      );
    },
    checkMnemonic: async (mnemonic: string) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.check-mnemonic',
        mnemonic
      );
    },
    checkPasscode: async (passcode: number[]) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.check-passcode',
        passcode
      );
    },
    checkProviderURL: async (providerURL: string) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.check-provider-url',
        providerURL
      );
    },
    navigate: async (
      view: WalletView,
      options?: {
        canReturn?: boolean;
        walletIndex?: string;
        detail?: { type: 'transaction' | 'coin' | 'nft'; key: string };
        action?: { type: string; data: any };
      }
    ) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.navigate',
        view,
        options
      );
    },
    navigateBack: async () => {
      return await ipcRenderer.invoke('realm.tray.wallet.navigateBack');
    },
    setView: async (
      view: WalletView,
      index?: string,
      currentItem?: { type: 'transaction' | 'nft' | 'coin'; key: string },
      unsetCurrentItem?: boolean
    ) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.set-view',
        view,
        index,
        currentItem,
        unsetCurrentItem
      );
    },
    setReturnView: async (view: WalletView) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.set-return-view',
        view
      );
    },
    setNetwork: async (network: NetworkType) => {
      return await ipcRenderer.invoke('realm.tray.wallet.set-network', network);
    },
    getRecipient: async (patp: string) => {
      return await ipcRenderer.invoke('realm.tray.wallet.get-recipient', patp);
    },
    saveTransactionNotes: async (notes: string) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.save-transaction-notes',
        notes
      );
    },
    setSettings: async (network: string, settings: UISettingsType) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.set-settings',
        network,
        settings
      );
    },
    setSharingMode: async (who: string) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.set-sharing-mode',
        who
      );
    },
    changeDefaultWallet: async (network: string, index: number) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.change-default-wallet',
        network,
        index
      );
    },
    setNetworkProvider: async (network: string, provider: string) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.set-network-provider',
        network,
        provider
      );
    },
    createWallet: async (nickname: string) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.create-wallet',
        nickname
      );
    },
    sendEthereumTransaction: async (
      walletIndex: string,
      to: string,
      amount: string,
      toPatp?: string,
      contractType?: string
    ) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.send-ethereum-transaction',
        walletIndex,
        to,
        amount,
        toPatp,
        contractType
      );
    },
    sendERC20Transaction: async (
      walletIndex: string,
      to: string,
      amount: string,
      contractAddress: string,
      toPatp?: string,
      contractType?: string
    ) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.send-erc20-transaction',
        walletIndex,
        to,
        amount,
        contractAddress,
        toPatp,
        contractType
      );
    },
    sendERC721Transaction: async (
      walletIndex: string,
      to: string,
      contractAddress: string,
      tokenId: string,
      toPatp?: string,
      contractType?: string
    ) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.send-erc721-transaction',
        walletIndex,
        to,
        contractAddress,
        tokenId,
        toPatp,
        contractType
      );
    },
    sendBitcoinTransaction: async (
      walletIndex: number,
      to: string,
      amount: string
    ) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.send-bitcoin-transaction',
        walletIndex,
        to,
        amount
      );
    },
    addSmartContract: async (
      contractId: string,
      contractType: string,
      name: string,
      contractAddress: string,
      walletIndex: string
    ) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.add-smart-contract',
        contractId,
        contractType,
        name,
        contractAddress,
        walletIndex
      );
    },
    requestAddress: async (from: string, network: string) => {
      return await ipcRenderer.invoke('realm.tray.wallet.request-address');
    },
    getCoinTxns: async (
      walletAddr: string,
      tokenType: 'erc20' | 'erc721' | 'erc1155',
      contractAddr: string
    ) => {
      return await ipcRenderer.invoke(
        'realm.wallet.get-coin-txns',
        walletAddr,
        tokenType,
        contractAddr
      );
    },
    setNetworkProtocol: async (network: string) => {
      return await ipcRenderer.invoke('realm.tray.wallet.set-network-protocol', network);
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-expect-error
      // ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
      ipcMain.handle(handlerName, this.wrapHandler(this.handlers[handlerName]));
    });

    setInterval(this.autoLock.bind(this), AUTO_LOCK_INTERVAL);
  }

  private autoLock() {
    const shouldLock =
      this.state &&
      Date.now() - AUTO_LOCK_INTERVAL > this.state.lastInteraction.getTime();
    if (shouldLock) {
      this.lock();
    }
  }

  private lock() {
    const hasPasscode = this.state && this.state.passcodeHash;
    if (hasPasscode) {
      this.state!.navigate(WalletView.LOCKED);
    }
  }

  async setMnemonic(_event: any, mnemonic: string, passcode: number[]) {
    this.signer = new RealmSigner(this.core, mnemonic);
    const passcodeHash = await bcrypt.hash(passcode.toString(), 12);
    await WalletApi.setPasscodeHash(this.core.conduit!, passcodeHash);
    const ethPath = "m/44'/60'/0'/0";
    const btcPath = "m/44'/0'/0'/0";
    const btcTestnetPath = "m/44'/1'/0'/0";
    // eth
    console.log('setting eth xpub');
    let xpub: string = this.signer.getXpub(ethPath);
    console.log('ethxpub', xpub);
    await WalletApi.setXpub(this.core.conduit!, 'ethereum', xpub);
    // btc
    console.log('setting btc xpub');
    let xpub: string = this.signer.getXpub(btcPath);
    console.log('btcxpub', xpub);
    await WalletApi.setXpub(this.core.conduit!, 'bitcoin', xpub);
    // btc testnet
    console.log('setting btc testnet xpub');
    let xpub: string = this.signer.getXpub(btcTestnetPath);
    console.log('btctestnetxpub', xpub);
    await WalletApi.setXpub(this.core.conduit!, 'btctestnet', xpub);

    this.state!.ethereum.deleteWallets();
    WalletApi.getWallets(this.core.conduit!).then((wallets: any) => {
      this.state!.ethereum.initial(wallets);
      this.updateEthereumInfo();
      this.state!.bitcoin.initial(wallets);
      this.updateBitcoinInfo();
    });

    this.state!.navigate(WalletView.LIST);
  }

  setNetwork() {

  }

  getRecipient() {

  }

  saveTransactionNotes() {

  }

  setSettings() {

  }

  changeDefaultWallet() {

  }

  setNetworkProvider() {

  }

  createWallet() {

  }

  sendEthereumTransaction() {

  }

  sendERC20Transaction() {

  }

  sendERC721Transaction() {

  }

  sendBitcoinTransaction() {

  }

  requestAddress() {

  }

  checkPasscode() {

  }
  
  checkProviderUrl() {

  }

  setNetworkProtocol() {

  }

  checkMnemonic() {

  }

  navigate() {

  }

  navigateBack() {

  }

  getCoinTxns() {

  }

}
