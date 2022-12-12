import { ipcMain, ipcRenderer } from 'electron';
import { ethers, utils } from 'ethers';
import bcrypt from 'bcryptjs';
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
  WalletCreationMode,
  SharingMode,
  UISettingsType,
  EthWalletType,
  ProtocolType,
  NetworkStoreType,
} from './wallet-lib';
import { BaseSigner } from './wallet-lib/wallets/BaseSigner';
import { BaseProtocol } from './wallet-lib/wallets/BaseProtocol';
import { RealmSigner } from './wallet/signers/realm';
import { WalletApi } from '../../api/wallet';
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
import { Wallet } from './wallet-lib/Wallet';
import _ from 'lodash';

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
  private db?: Store<WalletStoreType> | EncryptedStore<WalletStoreType>; // for persistence
  private state?: WalletStoreType; // for state management
  private ethProvider?: ethers.providers.JsonRpcProvider;
  private alchemy?: Alchemy;
  handlers = {
    'realm.tray.wallet.set-mnemonic': this.setMnemonic,
    'realm.tray.wallet.set-network': this.setNetwork,
    'realm.tray.wallet.get-recipient': this.getRecipient,
    'realm.tray.wallet.save-transaction-notes': this.saveTransactionNotes,
    'realm.tray.wallet.set-xpub': this.setXpub,
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
    'realm.tray.wallet.toggle-network': this.toggleNetwork,
    'realm.tray.wallet.check-mnemonic': this.checkMnemonic,
    'realm.tray.wallet.navigate': this.navigate,
    'realm.tray.wallet.navigateBack': this.navigateBack,
    'realm.tray.wallet.get-coin-txns': this.getCoinTxns,
    'realm.tray.wallet.toggle-network': this.toggleNetwork,
    'realm.tray.wallet.toggle-uqbar': this.toggleUqbar,
    'realm.tray.wallet.watch-updates': this.watchUpdates,
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
    setXpub: async () => {
      return await ipcRenderer.invoke('realm.tray.wallet.set-xpub');
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
    toggleNetwork: async () => {
      return await ipcRenderer.invoke('realm.tray.wallet.toggle-network');
    },
    toggleUqbar: async () => {
      return await ipcRenderer.invoke('realm.tray.wallet.toggle-uqbar');
    },
    watchUpdates: async () => {
      return await ipcRenderer.invoke('realm.tray.wallet.watch-updates')
    }
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

  async getCoinTxns(
    _evt: any,
    walletAddr: string,
    tokenType: 'erc20' | 'erc721' | 'erc1155',
    contractAddr: string
  ) {
    let coinTxns;
    if (contractAddr) {
      coinTxns = await this.alchemy!.core.getAssetTransfers({
        fromAddress: walletAddr,
        contractAddresses: [contractAddr],
        category: [tokenType as AssetTransfersCategory],
      });
      //  const coinTxns = await this.alchemy!.core.getAssetTransfers({
      //    toAddress: wallet.address,
      //    contractAddresses: [token.contractAddress],
      //    category: [AssetTransfersCategory.ERC20],
      //  });
      // console.log('coinTxns', coinTxns);
    }
    return coinTxns;
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
    const hasPasscode = this.state && this.state.passcodeHash;
    if (hasPasscode) {
      this.state!.navigate(WalletView.LOCKED);
    }
  }

  private getPrivateKey() {
    return ethers.utils.HDNode.fromMnemonic(
      this.core.services.identity.auth.getMnemonic(null)
    );
  }

  async onLogin(ship: string) {
    const secretKey: string = this.core.passwords.getPassword(ship)!;
    const storeParams = {
      name: 'wallet',
      cwd: `realm.${ship}`,
      secretKey,
      accessPropertiesByDotNotation: true,
    };
    this.db = new Store<WalletStoreType>(storeParams);
    const persistedState: WalletStoreType = this.db.store;

    if (Object.keys(persistedState).length !== 0) {
      this.state = WalletStore.create(castToSnapshot(persistedState));
    } else {
      this.state = WalletStore.create({
        navState: {
          view: WalletView.NEW,
          network: NetworkType.ETHEREUM,
          btcNetwork: 'mainnet',
        },
        navHistory: [],
        ethereum: {
          network: 'gorli',
          settings: {
            walletCreationMode: WalletCreationMode.DEFAULT,
            sharingMode: SharingMode.ANYBODY,
            blocked: [],
            defaultIndex: 0,
          },
          initialized: false,
          conversions: {},
        },
        bitcoin: {
          settings: {
            walletCreationMode: WalletCreationMode.DEFAULT,
            sharingMode: SharingMode.ANYBODY,
            blocked: [],
            defaultIndex: 0,
          },
          conversions: {},
        },
        testnet: {
          settings: {
            walletCreationMode: WalletCreationMode.DEFAULT,
            sharingMode: SharingMode.ANYBODY,
            blocked: [],
            defaultIndex: 0,
          },
          conversions: {},
        },
        creationMode: 'default',
        sharingMode: 'anybody',
        ourPatp: ship,
        lastInteraction: Date.now(),
        initialized: false,
      });
    }

    onSnapshot(this.state, (snapshot: any) => {
      this.db!.store = snapshot;
    });

    this.setEthereumProviders();

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
      this.wallet!.updateWalletState(this.state!);
    })

    if (this.state.navState.view !== WalletView.NEW) {
      this.state.resetNavigation();
    }
    this.lock(); // lock wallet on login
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async setMnemonic(_event: any, mnemonic: string, passcode: number[]) {
    const passcodeHash = await bcrypt.hash(passcode.toString(), 12);
    this.state!.setPasscodeHash(passcodeHash);
    this.core.services.identity.auth.setMnemonic(
      'realm.auth.set-mnemonic',
      mnemonic
    );
    const privateKey = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const ethPath = "m/44'/60'/0'/0";
    const btcPath = "m/44'/0'/0'/0";
    const btcTestnetPath = "m/44'/1'/0'/0";
    // eth
    console.log('setting eth xpub');
    let xpub: string = privateKey.derivePath(ethPath).neuter().extendedKey;
    console.log('ethxpub', xpub);
    await WalletApi.setXpub(this.core.conduit!, 'ethereum', xpub);
    // btc
    console.log('setting btc xpub');
    xpub = privateKey.derivePath(btcPath).neuter().extendedKey;
    console.log('btcxpub', xpub);
    await WalletApi.setXpub(this.core.conduit!, 'bitcoin', xpub);
    // btc testnet
    console.log('setting btc testnet xpub');
    xpub = privateKey.derivePath(btcPath).neuter().extendedKey;
    console.log('btctestnetxpub', xpub);
    await WalletApi.setXpub(this.core.conduit!, 'btctestnet', xpub);

    this.state!.ethereum.deleteWallets();
    WalletApi.getWallets(this.core.conduit!).then((wallets: any) => {
      this.state!.ethereum.initial(wallets);
      this.updateEthereumInfo();
      this.state!.bitcoin.initial(wallets);
      this.updateBitcoinInfo();
    });

    // console.log('okay transitioning');
    this.state!.navigate(WalletView.LIST);
  }

  async checkPasscode(_event: any, passcode: number[]): Promise<boolean> {
    return await bcrypt.compare(passcode.toString(), this.state!.passcodeHash!);
  }

  async checkMnemonic(_event: any, mnemonic: string) {
    // TODO: Leo, can you implement this? Just needs to check against the existing
    // pub key and return true if it matches
    return true;
  }

  private lock() {
    const hasPasscode = this.state && this.state.settings.passcodeHash;
    this.wallet?.pauseUpdates();
    if (hasPasscode) {
      this.state!.navigate(WalletView.LOCKED);
    }
  }

  async setXpub(_event: any) {
    const ethPath = "m/44'/60'/0'/0";
    const btcPath = "m/44'/0'/0'/0";
    const btcTestnetPath = "m/44'/1'/0'/0";
    const privateKey = this.getPrivateKey();
    // eth
    let xpub: string = privateKey.derivePath(ethPath).neuter().extendedKey;
    await WalletApi.setXpub(this.core.conduit!, 'ethereum', xpub);
    // btc
    xpub = privateKey.derivePath(btcPath).neuter().extendedKey;
    await WalletApi.setXpub(this.core.conduit!, 'bitcoin', xpub);
    // btc testnet
    xpub = privateKey.derivePath(btcTestnetPath).neuter().extendedKey;
    await WalletApi.setXpub(this.core.conduit!, 'btctestnet', xpub);
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
    console.log(`wallet: navigating to ${view}`);
    this.state!.navigate(view, options);
  }

  navigateBack() {
    console.log(`wallet: navigating back`);
    this.state!.navigateBack();
  }

  async setNetwork(_event: any, network: NetworkType) {
    this.state!.navigate(WalletView.LIST);
    if (this.state!.navState.network !== network) {
      if (network === 'bitcoin') {
        this.ethProvider!.removeAllListeners();
        this.updateBitcoinInfo();
      } else {
        this.setEthereumProviders();
      }
      this.state!.setNetwork(network);
    }
  }

  async setChainNetwork(
    _event: any,
    network: NetworkType,
    chainNetwork: string
  ) {
    if (network === NetworkType.ETHEREUM) {
      this.state!.ethereum.network = chainNetwork;
    } else if (network === NetworkType.BITCOIN) {
    }
  }

  async getRecipient(_event: any, patp: string): Promise<RecipientPayload> {
    const recipientMetadata: {
      color?: string;
      avatar?: string;
      nickname?: string;
    } = await this.core.services.ship.getContact(null, patp);

    try {
      console.log('requesting address');
      const address: any = await WalletApi.getAddress(
        this.core.conduit!,
        this.state!.navState.network,
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
    const network = this.state!.navState.network;
    let net;
    if (network === 'ethereum') {
      net = this.state!.ethereum.network;
    } else {
      net = 'mainnet';
    }
    // const hash = this.state!.currentItem!.key;
    const hash = this.state!.navState.detail!.key;
    const index = this.state!.currentWallet!.index;
    await WalletApi.saveTransactionNotes(
      this.core.conduit!,
      network,
      net,
      index,
      hash,
      notes
    );
  }

  async getEthereumExchangeRate() {
    const url = `https://api.coingecko.com/api/v3/simple/price/?ids=ethereum&vs_currencies=usd`;
    const result: any = await axios.get(url);
    return Number(result.data.ethereum.usd);
  }

  async getERC20ExchangeRate(contractAddress: string) {
    const url = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddress}&vs_currencies=usd`;
    const result = await axios.get(url);
    return result.data[contractAddress]
      ? Number(result.data[contractAddress].usd)
      : undefined;
  }

  async getBitcoinExchangeRate() {
    const url = `https://api.coingecko.com/api/v3/simple/token_price/?ids=bitcoin&vs_currencies=usd`;
    const result: any = await axios.get(url);
    return Number(result.data.bitcoin.usd);
  }

  async setSettings(_events: any, network: string, settings: SettingsType) {
    if (network === 'ethereum') {
      this.state!.ethereum.setSettings(settings);
    }
    await WalletApi.setSettings(this.core.conduit!, network, settings);
  }

  async changeDefaultWallet(_event: any, network: string, index: number) {
    if (network == 'ethereum')
      this.state!.ethereum.settings.defaultIndex = index;
    else if (network == 'bitcoin')
      this.state!.bitcoin.settings.defaultIndex = index;
    await WalletApi.changeDefaultWallet(this.core.conduit!, network, index);
  }

  async setNetworkProvider(_event: any, network: string, provider: string) {
    if (network === 'ethereum') this.state!.ethereum.setProvider(provider);
    else if (network === 'bitcoin') this.state!.bitcoin.setProvider(provider);
    // await WalletApi.setNetworkProvider(this.core.conduit!, network, provider);
  }

  async createWallet(_event: any, nickname: string) {
    console.log(`creating with nickname: ${nickname}`);
    const sender: string = this.state!.ourPatp!;
    let network: string = this.state!.navState.network;
    if (
      network === 'bitcoin' &&
      this.state!.navState.btcNetwork === 'testnet'
    ) {
      network = 'btctestnet';
    }
    await WalletApi.createWallet(this.core.conduit!, sender, network, nickname);
    this.state!.navigate(WalletView.LIST, { canReturn: false });
  }

  async estimateCurrentGasFee(_event: any) {}

  async sendEthereumTransaction(
    _event: any,
    walletIndex: string,
    to: string,
    amount: string,
    toPatp?: string,
    contractType?: string
  ) {
    // console.log(walletIndex);
    // console.log(to);
    // console.log(amount);
    // console.log(toPatp);
    const path = "m/44'/60'/0'/0/0" + walletIndex;
    // console.log(path);
    // console.log(this.privateKey!.mnemonic!.phrase);
    const privateKey = this.getPrivateKey();
    const wallet = new ethers.Wallet(privateKey.derivePath(path).privateKey);
    const signer = wallet.connect(this.ethProvider!);
    // console.log(amount);
    const tx = {
      to,
      value: ethers.utils.parseEther(amount),
    };
    const { hash } = await signer.sendTransaction(tx);
    console.log('hash: ' + hash);
    const currentWallet = this.state!.currentWallet! as EthWalletType;
    const fromAddress = currentWallet.address;
    console.log(
      'right before enqueueTransaction',
      this.state?.ethereum.network
    );
    currentWallet.enqueueTransaction(
      this.state!.ethereum.network,
      hash,
      tx.to,
      toPatp,
      fromAddress,
      tx.value,
      new Date().toISOString(),
      contractType
    );
    console.log('740 here');
    const stateTx = currentWallet.getTransaction(
      this.state!.ethereum.network,
      hash
    );
    console.log(stateTx);
    await WalletApi.setTransaction(
      this.core.conduit!,
      'ethereum',
      this.state!.ethereum.network,
      currentWallet.index,
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
    toPatp?: string
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
    const signer = wallet.connect(this.ethProvider!);
    console.log(amount);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const ethAmount = ethers.utils.parseEther(amount);
    const erc20Amount = ethers.utils.parseUnits(
      amount,
      this.state!.ethereum.wallets.get(walletIndex)!.coins.get(contractAddress)!
        .decimals
    );
    const { hash } = await contract.transfer(to, erc20Amount);
    const currentWallet = this.state!.currentWallet! as EthWalletType;
    const fromAddress = currentWallet.address;
    currentWallet.enqueueTransaction(
      this.state!.ethereum.network,
      hash,
      to,
      toPatp,
      fromAddress,
      ethAmount,
      new Date().toISOString(),
      contractAddress
    );
    const stateTx = currentWallet.getTransaction(
      this.state!.ethereum.network,
      hash
    );
    console.log(stateTx);
    await WalletApi.setTransaction(
      this.core.conduit!,
      'ethereum',
      this.state!.ethereum.network,
      currentWallet.index,
      hash,
      stateTx
    );
  }

  async sendERC721Transaction(
    _event: any,
    walletIndex: string,
    to: string,
    contractAddress: string,
    tokenId: string,
    toPatp?: string,
    contractType?: string
  ) {
    console.log(walletIndex);
    console.log(to);
    console.log(toPatp);
    const path = "m/44'/60'/0'/0/0" + walletIndex;
    console.log(path);
    // console.log(this.privateKey!.mnemonic!.phrase);
    const privateKey = this.getPrivateKey();
    const wallet = new ethers.Wallet(privateKey.derivePath(path).privateKey);
    const signer = wallet.connect(this.ethProvider!);
    const contract = new ethers.Contract(contractAddress, nftabi, signer);
    const { hash } = await contract.transfer(to, tokenId);
    const currentWallet = this.state!.currentWallet! as EthWalletType;
    const fromAddress = currentWallet.address;
    currentWallet.enqueueTransaction(
      this.state!.ethereum.network,
      hash,
      to,
      toPatp,
      fromAddress,
      tokenId,
      new Date().toISOString(),
      'ERC721'
    );
    const stateTx = currentWallet.getTransaction(
      this.state!.ethereum.network,
      hash
    );
    console.log(stateTx);
    await WalletApi.setTransaction(
      this.core.conduit!,
      'ethereum',
      this.state!.ethereum.network,
      currentWallet.index,
      hash,
      stateTx
    );
  }

  async sendBitcoinTransaction(
    _event: any,
    walletIndex: string,
    to: string,
    amount: string
  ) {
    const senderPath = "m/44'/0'/0'/0/" + walletIndex;
    const hash = await this.createBitcoinTransaction(
      senderPath,
      to,
      Number(amount)
    );
    const tx: any = {};
    // const btcChain = this.state!.navState.btcNetwork === 'mainnet' ? 'btc/main' : 'btc/test3';
    // const url = `https://api.blockcypher.com/v1/${btcChain}/txs/push`;
    // const response = await axios.get(url);
    // console.log(response)
    await WalletApi.setTransaction(
      this.core.conduit!,
      'bitcoin',
      this.state!.navState.btcNetwork,
      this.state!.currentWallet!.index,
      hash,
      tx
    );
  }

  async checkPasscode(_event: any, passcode: number[]): Promise<boolean> {
    const result = await bcrypt.compare(
      passcode.toString(),
      this.state!.settings.passcodeHash!
    );
    if (result) {
      this.wallet!.watchUpdates(this.state!)
    }
    return result;
  }

  updateEthereumInfo() {
    this.getAllEthereumBalances();
    this.getAllCoins();
    this.getAllNfts();
    this.getAllEthereumTransactions();
    this.updateEthereumExchangeRates();
  }

  async updateEthereumExchangeRates() {
    this.state!.ethereum.setExchangeRate(await this.getEthereumExchangeRate());
    for (const key of this.state!.ethereum.wallets.keys()) {
      for (const coinKey of this.state!.ethereum.wallets.get(
        key
      )!.coins.keys()) {
        const coin = this.state!.ethereum.wallets.get(key)!.coins.get(coinKey)!;
        const exchange = await this.getERC20ExchangeRate(coin.address);
        if (exchange) {
          coin.setExchangeRate(exchange);
        }
      }
    }
  }

  gweiToEther = (gwei: number) => {
    return gwei / 1000000000000000000;
  };

  async getAllEthereumBalances() {
    if (this.state!.navState.network === 'bitcoin') {
    } else if (this.state!.navState.network === 'ethereum') {
      for (const key of this.state!.ethereum.wallets.keys()) {
        const wallet: any = this.state!.ethereum.wallets.get(key);
        const balance = await this.ethProvider!.getBalance(wallet.address);
        wallet.setBalance(utils.formatEther(balance));
      }
    }
  }

  async getAllCoins() {
    for (const key of this.state!.ethereum.wallets.keys()) {
      const wallet: any = this.state!.ethereum.wallets.get(key);
      const balances = await this.alchemy!.core.getTokenBalances(
        wallet.address
      );
      // console.log(balances);
      // Remove tokens with zero balance
      const nonZeroBalances = balances.tokenBalances.filter((token: any) => {
        return token.tokenBalance !== '0';
      });
      const coins = [];
      const txns = [];
      for (const token of nonZeroBalances) {
        const metadata = await this.alchemy!.core.getTokenMetadata(
          (token as any).contractAddress
        );
        const contract = new ethers.Contract(
          (token as any).contractAddress,
          abi,
          this.ethProvider
        );
        const wallet: any = this.state!.ethereum.wallets.get(key);
        const balance = (await contract.balanceOf(wallet.address)).toString();
        const coin = {
          name: metadata.symbol!,
          logo: metadata.logo || '',
          contractAddress: (token as any).contractAddress,
          balance,
          decimals: metadata.decimals!,
        };

        coins.push(coin);
      }

      this.state!.ethereum.wallets.get(key)!.setCoins(coins);
    }
  }

  async getAllNfts() {
    for (const key of this.state!.ethereum.wallets.keys()) {
      const wallet: any = this.state!.ethereum.wallets.get(key);
      const nfts = await this.alchemy!.nft.getNftsForOwner(wallet.address);
      const allNfts = [];
      for (const nft of nfts.ownedNfts) {
        // const price = await alchemy.nft.getFloorPrice(nft.contract.address)
        var floorPrice;
        const ownedNft = {
          name: nft.title,
          collectionName: nft.description,
          contractAddress: nft.contract.address,
          tokenId: nft.tokenId,
          imageUrl: nft.rawMetadata!.image!,
          floorPrice,
        };
        allNfts.push(ownedNft);
      }
      this.state!.ethereum.wallets.get(key)!.setNFTs(allNfts);
    }
  }

  toggleNetwork() {
    if (this.state!.navState.network === 'ethereum') {
      if (this.state!.ethereum.network === 'mainnet') {
        this.state!.ethereum.setNetwork('gorli');
        this.setEthereumProviders();
      } else if (this.state!.ethereum.network === 'gorli') {
        this.state!.ethereum.setNetwork('mainnet');
        this.setEthereumProviders();
      }
      this.updateEthereumInfo();
    } else if (this.state!.navState.network === 'bitcoin') {
      if (this.state!.navState.btcNetwork === 'mainnet') {
        this.state!.setBtcNetwork('testnet');
      } else if (this.state!.navState.btcNetwork === 'testnet') {
        this.state!.setBtcNetwork('mainnet');
      }
      this.updateBitcoinInfo();
    }
  }

  async getAllEthereumTransactions() {
    // etherscan api call
    for (const key of this.state!.ethereum.wallets.keys()) {
      const address = this.state!.ethereum.wallets.get(key)!.address;
      const startBlock = 0;
      const apiKey = 'EMD9R77ARFM6AYV2NMBTUQX4I5TM5W169G';
      const goerliURL = `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&sort=asc&apikey=${apiKey}`;
      const mainnetURL = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&sort=asc&apikey=${apiKey}`;
      const URL =
        this.state!.ethereum.network === 'mainnet' ? mainnetURL : goerliURL;
      const response: any = await axios.get(URL);
      this.state!.ethereum.wallets.get(key)!.applyTransactions(
        this.state!.ethereum.network,
        response.data.result
      );
    }
  }

  toggleUqbar(_evt: any) {
    this.state!.navState.protocol !== ProtocolType.UQBAR
      ? this.state!.setProtocol(ProtocolType.UQBAR)
      : this.state!.setProtocol(this.state!.navState.lastEthProtocol);
    this.wallet!.watchUpdates(this.state!);
  }
  
  async watchUpdates(_evt: any) {
    await this.wallet!.watchUpdates(this.state!);
  }
}
