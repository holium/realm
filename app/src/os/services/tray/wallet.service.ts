import { ipcMain, ipcRenderer } from 'electron';
import { BaseService } from '../base.service';
import Store from 'electron-store';
import EncryptedStore from '../../lib/encryptedStore';
import Realm from '../..';
/*import {
  WalletStore,
  WalletStoreType,
  WalletView,
  NetworkType,
  WalletCreationMode,
  SharingMode,
  UISettingsType,
  EthWalletType,
  SettingsType,
} from './wallet.model';*/
import { UISettingsType, WalletView, NetworkType, ProtocolType, SettingsType } from '@holium/realm-wallet/src/wallets/types';
import { BaseSigner } from '@holium/realm-wallet/src/wallets/BaseSigner';
import { RealmSigner } from './wallet/signers/realm';
import { WalletApi } from '../../api/wallet';
import bcrypt from 'bcryptjs';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
} from 'mobx-state-tree';
import { ethers } from 'ethers';
import { ProtocolWallet } from '@holium/realm-wallet/src/wallets/ProtocolWallet';
import { EthereumProtocol } from './wallet/models/ethereum';
import { UqbarProtocol } from './wallet/models/uqbar';
import { Wallet } from '@holium/realm-wallet/src/Wallet';

// 10 minutes
const AUTO_LOCK_INTERVAL = 1000 * 60 * 10;

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
  private db?: Store<Wallet> | EncryptedStore<Wallet>; // for persistence
  // private state?: WalletStoreType; // for state management
  private signer?: BaseSigner;
  private wallet?: Wallet;
  handlers = {
    'realm.tray.wallet.set-mnemonic': this.setMnemonic,
    'realm.tray.wallet.set-network': this.setNetwork,
    'realm.tray.wallet.get-recipient': this.getRecipient,
    'realm.tray.wallet.save-transaction-notes': this.saveTransactionNotes,
    'realm.tray.wallet.set-settings': this.setSettings,
    'realm.tray.wallet.change-default-wallet': this.changeDefaultWallet,
    'realm.tray.wallet.create-wallet': this.createWallet,
    'realm.tray.wallet.send-ethereum-transaction': this.sendEthereumTransaction,
    'realm.tray.wallet.send-erc20-transaction': this.sendERC20Transaction,
    'realm.tray.wallet.send-erc721-transaction': this.sendERC721Transaction,
    'realm.tray.wallet.send-bitcoin-transaction': this.sendBitcoinTransaction,
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
    setNetworkProtocol: async (protocol: string) => {
      return await ipcRenderer.invoke('realm.tray.wallet.set-network-protocol', protocol);
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

  async onLogin(ship: string) {
    const secretKey: string = this.core.passwords.getPassword(ship)!;
    const storeParams = {
      name: 'wallet',
      cwd: `realm.${ship}`,
      secretKey,
      accessPropertiesByDotNotation: true,
    };
    this.db = new Store<Wallet>(storeParams);
    const persistedState: Wallet = this.db.store;

    if (Object.keys(persistedState).length !== 0) {
      this.wallet = persistedState;
    } else {
      const ethereumMainnetWallet = new ProtocolWallet(this.signer, new EthereumProtocol('mainnet'));
      const ethereumGorliWallet = new ProtocolWallet(this.signer, new EthereumProtocol('gorli'))
      const uqbarWallet = new ProtocolWallet(this.signer, new UqbarProtocol());
      const ethMap = new Map<ProtocolType, ProtocolWallet>([
        ['ethmain', ethereumMainnetWallet],
        ['ethgorli', ethereumGorliWallet],
        ['uqbar', uqbarWallet],
      ]);
      const walletMap = new Map<NetworkType, Map<ProtocolType, ProtocolWallet>>([
        [NetworkType.ETHEREUM, ethMap]
      ])
      this.wallet = new Wallet(walletMap, NetworkType.ETHEREUM, 'ethmain');
    }

    onSnapshot(this.wallet!, (snapshot: any) => {
      this.db!.store = snapshot;
    });

    const patchEffect = {
      model: getSnapshot(this.wallet),
      resource: 'wallet',
      response: 'initial',
    };
    this.core.onEffect(patchEffect);

    onPatch(this.wallet, (patch) => {
      const patchEffect = {
        patch,
        resource: 'wallet',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });

    const ethereumMainnetWallet = new ProtocolWallet(this.signer, new EthereumProtocol('mainnet'));
    const ethereumGorliWallet = new ProtocolWallet(this.signer, new EthereumProtocol('gorli'))
    const uqbarWallet = new ProtocolWallet(this.signer, new UqbarProtocol());
    const ethMap = new Map<ProtocolType, ProtocolWallet>([
      ['ethmain', ethereumMainnetWallet],
      ['ethgorli', ethereumGorliWallet],
      ['uqbar', uqbarWallet],
    ]);
    const walletMap = new Map<NetworkType, Map<ProtocolType, ProtocolWallet>>([
      [NetworkType.ETHEREUM, ethMap]
    ])
    this.wallet = new Wallet(walletMap, NetworkType.ETHEREUM, 'ethmain');
    WalletApi.watchUpdates(this.core.conduit!, this.wallet!);

    if (this.wallet.navState.view !== WalletView.NEW) {
      this.wallet.resetNavigation();
    }
    this.lock(); // lock wallet on login
  }

  private wrapHandler(handler: any) {
    return (...args: any) => {
      if (this.wallet) {
        this.wallet.setLastInteraction(new Date());
      }
      return handler.apply(this, args);
    };
  }

  private autoLock() {
    const shouldLock =
      this.wallet &&
      Date.now() - AUTO_LOCK_INTERVAL > this.wallet.lastInteraction.getTime();
    if (shouldLock) {
      this.lock();
    }
  }

  private lock() {
    const hasPasscode = this.wallet && this.wallet.settings.passcodeHash;
    if (hasPasscode) {
      this.wallet!.navigate(WalletView.LOCKED);
    }
  }

  async setMnemonic(_event: any, mnemonic: string, passcode: number[]) {
    this.signer = new RealmSigner(this.core, mnemonic);
    const passcodeHash = await bcrypt.hash(passcode.toString(), 12);
    await WalletApi.setPasscodeHash(this.core.conduit!, passcodeHash);
    const ethPath = "m/44'/60'/0'/0";
    const btcPath = "m/44'/0'/0'/0";
    const btcTestnetPath = "m/44'/1'/0'/0";
    let xpub: string;
    // eth
    xpub = this.signer.getXpub(ethPath);
    await WalletApi.setXpub(this.core.conduit!, 'ethereum', xpub);
    // btc
    xpub = this.signer.getXpub(btcPath);
    await WalletApi.setXpub(this.core.conduit!, 'bitcoin', xpub);
    // btc testnet
    xpub = this.signer.getXpub(btcTestnetPath);
    await WalletApi.setXpub(this.core.conduit!, 'btctestnet', xpub);

    this.wallet!.navigate(WalletView.LIST);
  }

  async setNetwork(_event: any, network: NetworkType) {
    this.wallet!.navigate(WalletView.LIST);
    if (this.wallet!.navState.network !== network) {
      this.wallet!.setNetwork(network);
    }
  }

  async getRecipient(_event: any, patp: string): Promise<RecipientPayload> {
    const recipientMetadata: {
      color?: string;
      avatar?: string;
      nickname?: string;
    } = await this.core.services.ship.getContact(null, patp);

    try {
      const address: any = await WalletApi.getAddress(
        this.core.conduit!,
        this.wallet!.navState.network,
        patp
      );
      console.log('got address: ', address);

      return {
        patp,
        recipientMetadata,
        address: address ? address.address : null,
        gasEstimate: 7,
      };
    } catch (e) {
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
    const network = this.wallet!.currentNetwork;
    const net = this.wallet!.currentProtocol;
    // const hash = this.state!.currentItem!.key;
    const hash = this.wallet!.navState.detail!.key;
    const index = this.wallet!.currentWallet!.index;
    await WalletApi.saveTransactionNotes(
      this.core.conduit!,
      network,
      net,
      index,
      hash,
      notes
    );
  }

  async setSettings(_events: any, network: string, settings: SettingsType) {
    await WalletApi.setSettings(this.core.conduit!, network, settings);
  }

  async changeDefaultWallet(_event: any, network: string, index: number) {
    await WalletApi.changeDefaultWallet(this.core.conduit!, network, index);
  }

  async createWallet(_event: any, nickname: string) {
    console.log(`creating with nickname: ${nickname}`);
    const sender: string = this.core.conduit!.ship!;
    let network: string = this.wallet!.navState.network;
    if (
      network === 'bitcoin' &&
      this.wallet!.navState.btcNetwork === 'testnet'
    ) {
      network = 'btctestnet';
    }
    await WalletApi.createWallet(this.core.conduit!, sender, network, nickname);
    this.wallet!.navigate(WalletView.LIST, { canReturn: false });
  }

  async sendEthereumTransaction(
    _event: any,
    walletIndex: string,
    to: string,
    amount: string,
    toPatp?: string,
    contractType?: string
  ) {
    const path = "m/44'/60'/0'/0/0" + walletIndex;
    const tx = {
      to,
      value: ethers.utils.parseEther(amount),
    };
    const transaction = this.signer?.signTransaction(path, tx);
    const hash = await this.wallet!.wallets.get(this.wallet!.currentNetwork)!.get(this.wallet!.currentProtocol).accounts[walletIndex].sendTransaction(transaction);
    const currentWallet = this.wallet!.currentWallet! as EthWalletType;
    const fromAddress = currentWallet.address;
    currentWallet.enqueueTransaction(
      this.wallet!.currentProtocol,
      hash,
      tx.to,
      toPatp,
      fromAddress,
      tx.value,
      new Date().toISOString(),
      contractType
    );
    const stateTx = currentWallet.getTransaction(
      this.wallet!.currentProtocol,
      hash
    );
    await WalletApi.setTransaction(
      this.core.conduit!,
      'ethereum',
      this.wallet!.currentProtocol,
      currentWallet.index,
      hash,
      stateTx
    );
  }

  sendERC20Transaction() {
  }

  sendERC721Transaction() {

  }

  sendBitcoinTransaction() {

  }

  async checkPasscode(_event: any, passcode: number[]): Promise<boolean> {
    return await bcrypt.compare(passcode.toString(), this.wallet!.settings.passcodeHash!);
  }
  
  async checkProviderUrl(_event: any, providerURL: string): Promise<boolean> {
    try {
      const newProvider = new ethers.providers.JsonRpcProvider(providerURL);
      console.log('new provider: ', newProvider);
      const { chainId, name } = await newProvider.getNetwork();
      console.log('network name: ', name);
      console.log(`chain ID: ${chainId}`);
      if (!chainId && !name) {
        throw new Error('Invalid provider.');
      }
      return true;
    } catch {
      return false;
    }
  }

  setNetworkProtocol(_event: any, protocol: string) {
    this.wallet!.setCurrentProtocol(protocol);
  }

  async checkMnemonic(_event: any, mnemonic: string) {
    // TODO: implement
    return true;
  }

  navigate(
    _event: any,
    view: WalletView,
    options?: {
      canReturn?: boolean;
      walletIndex?: string;
      detail?: { type: 'transaction' | 'coin' | 'nft'; key: string };
      action?: { type: string; data: any };
    }
  ) {
    this.wallet!.navigate(view, options);
  }

  navigateBack() {
    this.wallet!.navigateBack();
  }

  async getCoinTxns(
    _evt: any,
    walletAddr: string,
    tokenType: 'erc20' | 'erc721' | 'erc1155',
    contractAddr: string
  ) {
    let coinTxns = this.wallet!.wallets.get(NetworkType.ETHEREUM)!.get(this.wallet!.currentProtocol)!.getAccountAssets(walletAddr);
    return coinTxns;
  }

}
