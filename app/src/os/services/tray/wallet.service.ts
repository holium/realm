import { ipcMain, ipcRenderer } from 'electron';
import { BaseService } from '../base.service';
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
  ProtocolType,
  NetworkStoreType,
  WalletNavOptions,
} from './wallet-lib/wallet.model';
import { BaseProtocol } from './wallet-lib/wallets/BaseProtocol';
import { RealmSigner } from './wallet/signers/realm';
import { WalletApi } from '../../api/wallet';
import { removeDots, UqbarApi } from '../../api/uqbar';
import bcrypt from 'bcryptjs';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { ethers } from 'ethers';
import { EthereumProtocol } from './wallet/protocols/ethereum';
import { UqbarProtocol } from './wallet/protocols/uqbar';
import { Wallet } from './wallet-lib/ProtocolManager';
import { BaseBlockProtocol } from './wallet-lib/wallets/BaseBlockProtocol';

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

const initialWalletState = (ship: string) => ({
  navState: {
    view: WalletView.NEW,
    protocol: ProtocolType.ETH_GORLI,
    lastEthProtocol: ProtocolType.ETH_GORLI,
    btcNetwork: NetworkStoreType.BTC_MAIN,
  },
  ethereum: {
    gorliBlock: 0,
    protocol: ProtocolType.ETH_GORLI,
    settings: {
      walletCreationMode: WalletCreationMode.DEFAULT,
      sharingMode: SharingMode.ANYBODY,
      defaultIndex: 0,
    },
    initialized: false,
    conversions: {},
  },
  bitcoin: {
    block: 0,
    settings: {
      walletCreationMode: WalletCreationMode.DEFAULT,
      sharingMode: SharingMode.ANYBODY,
      defaultIndex: 0,
    },
    conversions: {},
  },
  btctest: {
    block: 0,
    settings: {
      walletCreationMode: WalletCreationMode.DEFAULT,
      sharingMode: SharingMode.ANYBODY,
      defaultIndex: 0,
    },
    conversions: {},
  },
  navHistory: [],
  creationMode: 'default',
  sharingMode: 'anybody',
  lastInteraction: Date.now(),
  initialized: false,
  settings: {
    passcodeHash: '',
  },
  ourPatp: ship,
  forceActive: false,
});

export class WalletService extends BaseService {
  private db?: Store<WalletStoreType> | EncryptedStore<WalletStoreType>; // for persistence
  private state?: WalletStoreType; // for state management
  private initialState?: any;
  private signer: RealmSigner;
  private wallet?: Wallet;
  handlers = {
    'realm.tray.wallet.set-mnemonic': this.setMnemonic,
    'realm.tray.wallet.set-network': this.setNetwork,
    'realm.tray.wallet.set-protocol': this.setProtocol,
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
    'realm.tray.wallet.check-mnemonic': this.checkMnemonic,
    'realm.tray.wallet.navigate': this.navigate,
    'realm.tray.wallet.navigate-back': this.navigateBack,
    'realm.tray.wallet.toggle-network': this.toggleNetwork,
    'realm.tray.wallet.toggle-uqbar': this.toggleUqbar,
    'realm.tray.wallet.uqbar-desk-exists': this.uqbarDeskExists,
    'realm.tray.wallet.enqueue-uqbar-transaction': this.enqueueUqbarTransaction,
    'realm.tray.wallet.submit-uqbar-transaction': this.submitUqbarTransaction,
    'realm.tray.wallet.watch-updates': this.watchUpdates,
    'realm.tray.wallet.set-force-active': this.setForceActive,
    'realm.tray.wallet.reset-navigation': this.resetNavigation,
    'realm.tray.wallet.delete-local-wallet': this.deleteLocalWallet,
    'realm.tray.wallet.delete-ship-wallet': this.deleteShipWallet,
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
    navigate: async (view: WalletView, options?: WalletNavOptions) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.navigate',
        view,
        options
      );
    },
    navigateBack: async () => {
      return await ipcRenderer.invoke('realm.tray.wallet.navigate-back');
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
    setProtocol: async (protocol: ProtocolType) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.set-protocol',
        protocol
      );
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
      passcode: number[],
      toPatp?: string
    ) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.send-ethereum-transaction',
        walletIndex,
        to,
        amount,
        passcode,
        toPatp
      );
    },
    sendERC20Transaction: async (
      walletIndex: string,
      to: string,
      amount: string,
      contractAddress: string,
      passcode: number[],
      toPatp?: string,
      contractType?: string
    ) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.send-erc20-transaction',
        walletIndex,
        to,
        amount,
        contractAddress,
        passcode,
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
    toggleNetwork: async () => {
      return await ipcRenderer.invoke('realm.tray.wallet.toggle-network');
    },
    toggleUqbar: async () => {
      return await ipcRenderer.invoke('realm.tray.wallet.toggle-uqbar');
    },
    uqbarDeskExists: async () => {
      return await ipcRenderer.invoke('realm.tray.wallet.uqbar-desk-exists');
    },
    enqueueUqbarTransaction: async (walletIndex: string, amount: string) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.enqueue-uqbar-transaction',
        walletIndex,
        amount
      );
    },
    submitUqbarTransaction: async (walletIndex: string, passcode: number[]) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.submit-uqbar-transaction',
        walletIndex,
        passcode
      );
    },
    watchUpdates: async () => {
      return await ipcRenderer.invoke('realm.tray.wallet.watch-updates');
    },
    setForceActive: async (forceActive: boolean) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.set-force-active',
        forceActive
      );
    },
    resetNavigation: async () => {
      return await ipcRenderer.invoke('realm.tray.wallet.reset-navigation');
    },
    deleteLocalWallet: async (passcode: number[]) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.delete-local-wallet',
        passcode
      );
    },
    deleteShipWallet: async (passcode: number[]) => {
      return await ipcRenderer.invoke(
        'realm.tray.wallet.delete-ship-wallet',
        passcode
      );
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
    this.signer = new RealmSigner(this.core);
  }

  async onLogin(ship: string, forceReset: boolean) {
    console.log('logging in');
    const secretKey: string = this.core.passwords.getPassword(ship)!;
    const storeParams = {
      name: 'wallet',
      cwd: `realm.${ship}`,
      secretKey,
      accessPropertiesByDotNotation: true,
    };
    this.db = new Store<WalletStoreType>(storeParams);
    const persistedState: WalletStoreType = this.db.store;

    if (Object.keys(persistedState).length !== 0 && !forceReset) {
      this.state = WalletStore.create(castToSnapshot(persistedState));
    } else {
      this.state = WalletStore.create(initialWalletState(ship));
    }

    onSnapshot(this.state!, (snapshot: any) => {
      this.db!.store = snapshot;
    });

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

    const protocolMap = new Map<ProtocolType, BaseProtocol>([
      [ProtocolType.ETH_MAIN, new EthereumProtocol(ProtocolType.ETH_MAIN)],
      [ProtocolType.ETH_GORLI, new EthereumProtocol(ProtocolType.ETH_GORLI)],
      [ProtocolType.UQBAR, new UqbarProtocol()],
    ]);
    this.wallet = new Wallet(protocolMap, this.state!.navState.protocol);
    WalletApi.watchUpdates(this.core.conduit!, this.state!, () => {
      this.wallet!.updateWalletState(
        this.core.conduit!,
        this.state!,
        ProtocolType.UQBAR
      );
      if (
        this.state!.navState.network === NetworkType.ETHEREUM &&
        !(this.state!.navState.protocol === ProtocolType.UQBAR)
      ) {
        this.wallet?.updateWalletState(this.core.conduit!, this.state!);
      }
    });
    UqbarApi.watchUpdates(this.core.conduit!, this.state!);

    if (this.state.navState.view !== WalletView.NEW) {
      this.state.resetNavigation();
    }
    this.lock(); // lock wallet on login
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  private wrapHandler(handler: any) {
    return (...args: any) => {
      if (this.state) {
        this.state.setLastInteraction(new Date());
      }
      return handler.apply(this, args);
    };
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
    const hasPasscode = this.state && this.state.settings.passcodeHash;
    this.wallet?.pauseUpdates();
    if (hasPasscode) {
      this.state!.navigate(WalletView.LOCKED);
    }
  }

  async setMnemonic(_event: any, mnemonic: string, passcode: number[]) {
    const passcodeString = passcode.map(String).join('');
    console.log(passcodeString);
    (this.signer as RealmSigner).setMnemonic(
      mnemonic,
      this.state!.ourPatp!,
      passcodeString
    );
    const passcodeHash = await bcrypt.hash(passcodeString, 12);
    await WalletApi.setPasscodeHash(this.core.conduit!, passcodeHash);
    const ethPath = "m/44'/60'/0'";
    const btcPath = "m/44'/0'/0'";
    const btcTestnetPath = "m/44'/1'/0'";
    let xpub: string;
    // eth
    xpub = this.signer.getXpub(ethPath, this.state!.ourPatp!, passcodeString);
    await WalletApi.setXpub(this.core.conduit!, 'ethereum', xpub);
    // btc
    xpub = this.signer.getXpub(btcPath, this.state!.ourPatp!, passcodeString);
    await WalletApi.setXpub(this.core.conduit!, 'bitcoin', xpub);
    // btc testnet
    xpub = this.signer.getXpub(
      btcTestnetPath,
      this.state!.ourPatp!,
      passcodeString
    );
    await WalletApi.setXpub(this.core.conduit!, 'btctestnet', xpub);

    this.state!.navigate(WalletView.LIST);
  }

  async setNetwork(_event: any, network: NetworkType) {
    this.state!.navigate(WalletView.LIST);
    if (this.state!.navState.network !== network) {
      this.state!.setNetwork(network);
      this.wallet!.watchUpdates(this.core.conduit!, this.state!);
    }
  }

  setProtocol(_event: any, protocol: ProtocolType) {
    this.state!.navigate(WalletView.LIST);
    if (this.state!.navState.protocol !== protocol) {
      this.state!.setProtocol(protocol);
      this.wallet!.watchUpdates(this.core.conduit!, this.state!);
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
        this.state!.navState.network,
        patp
      );

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
    const network = this.state!.navState.network;
    const net = this.state!.navState.protocol;
    const contract =
      this.state!.navState.detail!.txtype === 'coin'
        ? this.state!.navState.detail!.coinKey!
        : null;
    const hash = this.state!.navState.detail!.key;
    const index = this.state!.currentWallet!.index;
    await WalletApi.saveTransactionNotes(
      this.core.conduit!,
      network,
      net,
      index,
      contract,
      hash,
      notes
    );
  }

  async setSettings(_events: any, network: string, settings: UISettingsType) {
    await WalletApi.setSettings(this.core.conduit!, network, settings);
  }

  async changeDefaultWallet(_event: any, network: string, index: number) {
    await WalletApi.changeDefaultWallet(this.core.conduit!, network, index);
  }

  async createWallet(_event: any, nickname: string) {
    const sender: string = this.state!.ourPatp!;
    let network: string = this.state!.navState.network;
    if (
      network === 'bitcoin' &&
      this.state!.navState.btcNetwork === NetworkStoreType.BTC_TEST
    ) {
      network = 'btctestnet';
    }
    await WalletApi.createWallet(this.core.conduit!, sender, network, nickname);
    this.state!.navigate(WalletView.LIST, { canReturn: false });
  }

  async enqueueUqbarTransaction(
    _event: any,
    walletIndex: string,
    to: string,
    amount: string
  ) {
    /*const from = this.state!.ethereum.wallets.get(walletIndex)!.address;
    // const protocol = this.wallet!.currentProtocol;
    const tx = {
      from,
      to,
      value: ethers.utils.parseEther(amount),
      gasLimit: await protocol.getFeeEstimate({
        to,
        from,
        value: ethers.utils.parseEther(amount),
      }),
      gasPrice: await protocol.getFeePrice(),
      nonce: await protocol.getNonce(from),
      chainId: await protocol.getChainId(),
    };
    const tx = this.state!.uqTx!;
    const ZIG_CONTRACT_ADDRESS = '0x74.6361.7274.6e6f.632d.7367.697a';
    const item = this.state!.ethereum.wallets.get(walletIndex)!.data.get(this.state!.navState.protocol)!.uqbarTokenId!;
    await UqbarApi.enqueueTransaction(this.core.conduit!, from, ZIG_CONTRACT_ADDRESS, '0x0', to, item, Number(amount));
    const pendingTxns = await UqbarApi.scryPending(this.core.conduit!, from);
*/
  }

  async submitUqbarTransaction(
    _event: any,
    walletIndex: string,
    passcode: number[]
    // toPatp?: string,
  ) {
    /*const from = this.state!.ethereum.wallets.get(walletIndex)!.address;
    const tx = {
      from,
      to,
      value: ethers.utils.parseEther(amount),
      /*gasLimit: await protocol.getFeeEstimate({
        to,
        from,
        value: ethers.utils.parseEther(amount),
      }),*/
    // gasPrice: await protocol.getFeePrice(),
    // nonce: await protocol.getNonce(from),
    // chainId: await protocol.getChainId(),
    // };
    const uqTx = this.state!.uqTx!;
    const tx = {
      ...uqTx,
      rate: 2,
      budget: 2000000,
    };
    // const ZIG_CONTRACT_ADDRESS = '0x74.6361.7274.6e6f.632d.7367.697a';
    /*const item = this.state!.ethereum.wallets.get(walletIndex)!.data.get(this.state!.navState.protocol)!.uqbarTokenId!;
    await UqbarApi.enqueueTransaction(this.core.conduit!, from, ZIG_CONTRACT_ADDRESS, '0x0', to, item, Number(amount));
    const pendingTxns = await UqbarApi.scryPending(this.core.conduit!, from);
    let hash = Object.keys(pendingTxns)
      .filter(hash => pendingTxns[hash].from === addDots(from))
      .sort((a, b) => pendingTxns[a].nonce - pendingTxns[b].nonce)[0]
    console.log(hash)
    const txn = pendingTxns[hash];*/
    const path = "m/44'/60'/0'/0/0" + walletIndex;
    const contract = removeDots(tx.contract.slice(2));
    const to =
      (tx as any)?.action?.give?.to ||
      (tx as any)?.action?.['give-nft']?.to ||
      `0x${contract}${contract}`;
    const signed = await (this.signer! as RealmSigner).signUqbarTransaction(
      path,
      tx.hash,
      { ...tx, to },
      this.state!.ourPatp!,
      passcode.map(String).join('')
    );
    console.log('signed the tx');
    console.log(signed.sig);
    await UqbarApi.submitSigned(
      this.core.conduit!,
      tx.from,
      tx.hash,
      tx.rate,
      tx.budget,
      signed.ethHash,
      signed.sig
    ); //signed.ethHash, signed.sig);
    console.log('submitted');
    const hash = removeDots(tx.hash);
    const currentWallet = this.state!.currentWallet! as EthWalletType;
    const fromAddress = currentWallet.address;
    currentWallet.enqueueTransaction(
      this.state!.navState.protocol,
      hash,
      '',
      '', //toPatp,
      fromAddress,
      '',
      new Date().toISOString()
    );
    console.log('enqueued');
    const stateTx = currentWallet.data
      .get(this.state!.navState.protocol)!
      .transactionList.getStoredTransaction(hash);
    await WalletApi.setTransaction(
      this.core.conduit!,
      'ethereum',
      this.state!.navState.protocol,
      currentWallet.index,
      null,
      hash,
      stateTx
    );
  }

  async sendEthereumTransaction(
    _event: any,
    walletIndex: string,
    to: string,
    amount: string,
    passcode: number[],
    toPatp?: string
  ) {
    const path = "m/44'/60'/0'/0/0" + walletIndex;
    const protocol = this.wallet!.protocols.get(
      this.state!.navState.protocol
    ) as EthereumProtocol;
    const from = this.state!.ethereum.wallets.get(walletIndex)!.address;
    const tx = {
      from,
      to,
      value: ethers.utils.parseEther(amount),
      gasLimit: await protocol.getFeeEstimate({
        to,
        from,
        value: ethers.utils.parseEther(amount),
      }),
      gasPrice: await protocol.getFeePrice(),
      nonce: await protocol.getNonce(from),
      chainId: await protocol.getChainId(),
    };
    const signedTx = await this.signer!.signTransaction(
      path,
      tx,
      this.state!.ourPatp!,
      passcode.map(String).join('')
    );
    const hash = await (
      this.wallet!.protocols.get(
        this.state!.navState.protocol
      )! as BaseBlockProtocol
    ).sendTransaction(signedTx);
    const currentWallet = this.state!.currentWallet! as EthWalletType;
    const fromAddress = currentWallet.address;
    currentWallet.enqueueTransaction(
      this.state!.navState.protocol,
      hash,
      tx.to,
      toPatp,
      fromAddress,
      tx.value,
      new Date().toISOString()
    );
    const stateTx = currentWallet.data
      .get(this.state!.navState.protocol)!
      .transactionList.getStoredTransaction(hash);

    await WalletApi.setTransaction(
      this.core.conduit!,
      'ethereum',
      this.state!.navState.protocol,
      currentWallet.index,
      null,
      hash,
      stateTx
    );
  }

  async sendERC20Transaction(
    _event: any,
    walletIndex: string,
    to: string,
    amount: string,
    contractAddress: string,
    passcode: number[],
    toPatp?: string
  ) {
    const path = "m/44'/60'/0'/0/0" + walletIndex;
    console.log(walletIndex, to, amount, toPatp, path);

    const ethAmount = ethers.utils.parseEther(amount);
    const tx = await (
      this.wallet!.protocols.get(
        this.state!.navState.protocol
      )! as EthereumProtocol
    ).populateERC20(
      contractAddress,
      to,
      amount,
      this.state!.ethereum.wallets.get(walletIndex)!
        .data.get(this.state!.navState.protocol)!
        .coins.get(contractAddress)!.decimals
    );
    const protocol = this.wallet!.protocols.get(
      this.state!.navState.protocol
    ) as EthereumProtocol;
    const from = this.state!.ethereum.wallets.get(walletIndex)!.address;
    tx.from = from;
    tx.gasLimit = await protocol.getFeeEstimate(tx);
    tx.gasPrice = await protocol.getFeePrice();
    tx.nonce = await protocol.getNonce(from);
    tx.chainId = await protocol.getChainId();
    const signedTx = await this.signer!.signTransaction(
      path,
      tx,
      this.state!.ourPatp!,
      passcode.map(String).join('')
    );
    const hash = await (
      this.wallet!.protocols.get(
        this.state!.navState.protocol
      )! as BaseBlockProtocol
    ).sendTransaction(signedTx);
    const currentWallet = this.state!.currentWallet! as EthWalletType;
    const fromAddress = currentWallet.address;
    currentWallet.enqueueTransaction(
      this.state!.navState.protocol,
      hash,
      to,
      toPatp,
      fromAddress,
      ethAmount,
      new Date().toISOString(),
      contractAddress
    );
    const stateTx = currentWallet.data
      .get(this.state!.navState.protocol)!
      .coins.get(contractAddress)!
      .transactionList.getStoredTransaction(hash);
    console.log(stateTx);
    await WalletApi.setTransaction(
      this.core.conduit!,
      'ethereum',
      this.state!.navState.protocol,
      currentWallet.index,
      contractAddress,
      hash,
      stateTx
    );
  }

  sendERC721Transaction() {}

  sendBitcoinTransaction() {}

  async checkPasscode(_event: any, passcode: number[]): Promise<boolean> {
    return await bcrypt.compare(
      passcode.map(String).join(''),
      this.state!.settings.passcodeHash!
    );
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

  async checkMnemonic(_event: any, mnemonic: string) {
    const ethXpub = ethers.utils.HDNode.fromMnemonic(mnemonic)
      .derivePath("m/44'/60'/0'")
      .neuter().extendedKey;
    const agentEthXpub = (await WalletApi.getEthXpub(this.core.conduit!))[
      'eth-xpub'
    ];
    return ethXpub === agentEthXpub;
  }

  navigate(_event: any, view: WalletView, options?: WalletNavOptions) {
    this.state!.navigate(view, options);
  }

  navigateBack() {
    this.state!.navigateBack();
  }

  toggleNetwork(_evt: any) {
    if (this.state!.navState.network === NetworkType.ETHEREUM) {
      if (this.state!.navState.protocol === ProtocolType.ETH_MAIN) {
        this.state!.setProtocol(ProtocolType.ETH_GORLI);
        this.wallet!.watchUpdates(this.core.conduit!, this.state!);
      } else if (this.state!.navState.protocol === ProtocolType.ETH_GORLI) {
        this.state!.setProtocol(ProtocolType.ETH_MAIN);
        this.wallet!.watchUpdates(this.core.conduit!, this.state!);
      }
    }
  }

  async uqbarDeskExists(_evt: any) {
    return await UqbarApi.uqbarDeskExists(this.core.conduit!);
  }

  toggleUqbar(_evt: any) {
    this.state!.navState.protocol !== ProtocolType.UQBAR
      ? this.state!.setProtocol(ProtocolType.UQBAR)
      : this.state!.setProtocol(this.state!.navState.lastEthProtocol);
    this.wallet!.watchUpdates(this.core.conduit!, this.state!);
  }

  async watchUpdates(_evt: any) {
    this.wallet!.watchUpdates(this.core.conduit!, this.state!);
  }

  async setForceActive(_evt: any, forceActive: boolean) {
    this.state!.setForceActive(forceActive);
  }

  async resetNavigation() {
    this.state!.resetNavigation();
  }

  async deleteLocalWallet(_evt: any, passcode: number[]) {
    const passcodeString = passcode.map(String).join('');
    (this.signer! as RealmSigner).deleteMnemonic(
      this.state!.ourPatp!,
      passcodeString
    );
    this.onLogin(this.state!.ourPatp!, true);
  }

  async deleteShipWallet(_evt: any, passcode: number[]) {
    const passcodeString = passcode.map(String).join('');
    (this.signer! as RealmSigner).deleteMnemonic(
      this.state!.ourPatp!,
      passcodeString
    );
    WalletApi.initialize(this.core.conduit!);
    this.onLogin(this.state!.ourPatp!, true);
  }
}
