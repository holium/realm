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
} from './wallet.model';
import EncryptedStore from '../../lib/encryptedStore';
import { Network, Alchemy } from 'alchemy-sdk';
// @ts-ignore
import abi from 'human-standard-token-abi';
// @ts-ignore
import nftabi from 'non-fungible-token-abi';
import axios from 'axios';

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
    'realm.tray.wallet.get-ethereum-exchange-rate':
      this.getEthereumExchangeRate,
    'realm.tray.wallet.get-erc20-exchange-rate': this.getERC20ExchangeRate,
    'realm.tray.wallet.get-bitcoin-exchange-rate': this.getBitcoinExchangeRate,
    'realm.tray.wallet.navigate': this.navigate,
    'realm.tray.wallet.navigateBack': this.navigateBack,
  };

  static preload = {
    setMnemonic: (mnemonic: string, passcode: number[]) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.set-mnemonic',
        mnemonic,
        passcode
      );
    },
    checkMnemonic: (mnemonic: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.check-mnemonic', mnemonic);
    },
    checkPasscode: (passcode: number[]) => {
      return ipcRenderer.invoke('realm.tray.wallet.check-passcode', passcode);
    },
    checkProviderURL: (providerURL: string) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.check-provider-url',
        providerURL
      );
    },
    navigate: (
      view: WalletView,
      options?: {
        canReturn?: boolean;
        walletIndex?: string;
        detail?: { type: 'transaction' | 'coin' | 'nft'; key: string };
        action?: { type: string; data: any };
      }
    ) => {
      return ipcRenderer.invoke('realm.tray.wallet.navigate', view, options);
    },
    navigateBack: () => {
      return ipcRenderer.invoke('realm.tray.wallet.navigateBack');
    },
    setView: (
      view: WalletView,
      index?: string,
      currentItem?: { type: 'transaction' | 'nft' | 'coin'; key: string },
      unsetCurrentItem?: boolean
    ) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.set-view',
        view,
        index,
        currentItem,
        unsetCurrentItem
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
    setSettings: (network: string, settings: UISettingsType) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.set-settings',
        network,
        settings
      );
    },
    setSharingMode: (who: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.set-sharing-mode', who);
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
      contractType?: string
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
    sendERC20Transaction: (
      walletIndex: string,
      to: string,
      amount: string,
      contractAddress: string,
      toPatp?: string,
      contractType?: string
    ) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.send-erc20-transaction',
        walletIndex,
        to,
        amount,
        contractAddress,
        toPatp,
        contractType
      );
    },
    sendERC721Transaction: (
      walletIndex: string,
      to: string,
      contractAddress: string,
      tokenId: string,
      toPatp?: string,
      contractType?: string
    ) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.send-erc721-transaction',
        walletIndex,
        to,
        contractAddress,
        tokenId,
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
    toggleNetwork: () => {
      return ipcRenderer.invoke('realm.tray.wallet.toggle-network');
    },
    getEthereumExchangeRate: () => {
      return ipcRenderer.invoke('realm.tray.wallet.get-ethereum-exchange-rate');
    },
    getERC20ExchangeRate: (contractAddress: string) => {
      return ipcRenderer.invoke(
        'realm.tray.wallet.get-erc20-exchange-rate',
        contractAddress
      );
    },
    getBitcoinExchangeRate: () => {
      return ipcRenderer.invoke('realm.tray.wallet.get-bitcoin-exchange-rate');
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      // ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
      ipcMain.handle(handlerName, this.wrapHandler(this.handlers[handlerName]));
    });

    setInterval(this.autoLock.bind(this), AUTO_LOCK_INTERVAL);
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
    let shouldLock =
      this.state &&
      Date.now() - AUTO_LOCK_INTERVAL > this.state.lastInteraction.getTime();
    if (shouldLock) {
      this.lock();
    }
  }

  private lock() {
    let hasPasscode = this.state && this.state.passcodeHash;
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
    let secretKey: string = this.core.passwords.getPassword(ship)!;
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
        navState: {
          view: WalletView.NEW,
          network: NetworkType.ETHEREUM,
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
        },
        bitcoin: {
          network: 'mainnet',
          settings: {
            walletCreationMode: WalletCreationMode.DEFAULT,
            sharingMode: SharingMode.ANYBODY,
            blocked: [],
            defaultIndex: 0,
          },
        },
        testnet: {
          network: 'mainnet',
          settings: {
            walletCreationMode: WalletCreationMode.DEFAULT,
            sharingMode: SharingMode.ANYBODY,
            blocked: [],
            defaultIndex: 0,
          },
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

    WalletApi.subscribeToWallets(this.core.conduit!, async (wallet: any) => {
      if (wallet.network === 'ethereum') {
        this.state!.ethereum.applyWalletUpdate(this.state!.ethereum.network, wallet);
        this.updateEthereumInfo();
      }
      else if (wallet.network === 'bitcoin') {
        this.state!.bitcoin.applyWalletUpdate(wallet);
        this.updateBitcoinInfo();
      }
      else if (wallet.network === 'btctestnet') {
        this.state!.testnet.applyWalletUpdate(wallet);
        this.updateBitcoinInfo();
      }
    });
    WalletApi.getWallets(this.core.conduit!).then((wallets: any) => {
      if (
        Object.keys(wallets.ethereum).length !== 0 ||
        Object.keys(wallets.bitcoin).length !== 0 ||
        Object.keys(wallets.btctestnet).length !== 0
      ) {
        this.state!.setInitialized(true);
      }
      this.state!.ethereum.initial(wallets);
      this.updateEthereumInfo();
      this.state!.bitcoin.initial(wallets.bitcoin);
      this.state!.testnet.initial(wallets.btctestnet);
      this.updateBitcoinInfo();
    });
    WalletApi.subscribeToTransactions(
      this.core.conduit!,
      (transaction: any) => {
        if (transaction.network == 'ethereum')
          this.state!.ethereum.wallets.get(
            transaction.index
          )!.applyTransactionUpdate(transaction.net, transaction.transaction);
        //      else if (transaction.network == 'bitcoin')
        //        this.state!.bitcoin.applyTransactionUpdate(transaction);
        /*const tx = this.state!.ethereum.transactions.get(
          transaction.transaction.hash
        );*/
      }
    );
    WalletApi.getSettings(this.core.conduit!).then((settings: any) => {
      this.state!.ethereum.setSettings(settings);
    });

    this.setNetworkProvider(
      'realm.tray.wallet.set-network-provider',
      'ethereum',
      'https://goerli.infura.io/v3/e178fbf3fd694b1e8b29b110776749ce'
      //      'http://127.0.0.1:8545'
    );

    if (this.state.navState.view !== WalletView.NEW) {
      this.state.resetNavigation();
    }
    this.lock(); // lock wallet on login
    console.log('onlogin', this.state);
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async setMnemonic(_event: any, mnemonic: string, passcode: number[]) {
    console.log(this.state);
    let passcodeHash = await bcrypt.hash(passcode.toString(), 12);
    this.state!.setPasscodeHash(passcodeHash);
    this.core.services.identity.auth.setMnemonic(
      'realm.auth.set-mnemonic',
      mnemonic
    );
    const privateKey = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const ethPath = "m/44'/60'/0'/0";
    const btcPath = "m/44'/0'/0'/0";
    const btcTestnetPath = "m/44'/1'/0'/0"
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

    console.log('okay transitioning');
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

  async checkProviderUrl(_event: any, providerURL: string): Promise<boolean> {
    try {
      let newProvider = new ethers.providers.JsonRpcProvider(providerURL);
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

  async setXpub(_event: any) {
    const ethPath = "m/44'/60'/0'/0";
    const btcPath = "m/44'/0'/0'/0";
    const btcTestnetPath = "m/44'/1'/0'/0"
    const privateKey = this.getPrivateKey();
    // eth
    let xpub: string = privateKey.derivePath(ethPath).neuter().extendedKey;
    await WalletApi.setXpub(this.core.conduit!, 'ethereum', xpub);
    // btc
    xpub = privateKey.derivePath(btcPath).neuter().extendedKey;
    await WalletApi.setXpub(this.core.conduit!, 'bitcoin', xpub);
    // btc testnet
    xpub = privateKey.derivePath(btcTestnetPath).neuter().extendedKey;
    await WalletApi.setXpub(this.core.conduit!, 'btctestnet', xpub)
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
    if (this.state!.navState.network !== network) {
      if (network === 'bitcoin' || network === 'btctestnet') {
        this.ethProvider!.removeAllListeners();
        this.updateBitcoinInfo();
      }
      else {
        this.setEthereumProviders();
      }
      this.state!.navigate(WalletView.LIST);
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
        this.state!.navState.network,
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
    const network = this.state!.navState.network;
    var net;
    if (network === 'ethereum') {
      net = this.state!.ethereum.network;
    } else {
      net = 'mainnet';
    }
    // const hash = this.state!.currentItem!.key;
    const hash = this.state!.navState.detail!.key;
    const index = this.state!.currentWallet!.index;
    WalletApi.saveTransactionNotes(
      this.core.conduit!,
      network,
      net,
      index,
      hash,
      notes
    );
  }

  async getEthereumExchangeRate(_event: any) {
    const url = `https://api.coingecko.com/api/v3/simple/token_price/?ids=ethereum&vs_currencies=usd`;
    const result = await axios.get(url);
    console.log(result);
  }

  async getERC20ExchangeRate(_event: any, contractAddress: string) {
    const url = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddress}&vs_currencies=usd`;
    const result = await axios.get(url);
    console.log(result);
  }

  async getBitcoinExchangeRate(_event: any) {
    const url = `https://api.coingecko.com/api/v3/simple/token_price/?ids=bitcoin&vs_currencies=usd`;
    const result = await axios.get(url);
    console.log(result);
  }

  async setSettings(_events: any, network: string, settings: UISettingsType) {
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
    if (network == 'ethereum') this.state!.ethereum.setProvider(provider);
    else if (network == 'bitcoin') this.state!.bitcoin.setProvider(provider);
    // await WalletApi.setNetworkProvider(this.core.conduit!, network, provider);
  }

  async createWallet(_event: any, nickname: string) {
    console.log(`creating with nickname: ${nickname}`);
    const sender: string = this.state!.ourPatp!;
    const network: string = this.state!.navState.network;
    await WalletApi.createWallet(this.core.conduit!, sender, network, nickname);
    this.state!.navigate(
      WalletView.LIST,
      { canReturn: false }
    );
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
    const currentWallet = this.state!.currentWallet! as EthWalletType;
    const fromAddress = currentWallet.address;
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
    console.log('740 here')
    const stateTx = currentWallet.getTransaction(this.state!.ethereum.network, hash);
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
    toPatp?: string,
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
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const ethAmount = ethers.utils.parseEther(amount);
    let erc20Amount = ethers.utils.parseUnits(
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
    const stateTx = currentWallet.getTransaction(this.state!.ethereum.network, hash);
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
    let signer = wallet.connect(this.ethProvider!);
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
    const stateTx = currentWallet.getTransaction(this.state!.ethereum.network, hash);
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
    let sourceAddress = this.state!.bitcoin.wallets.get(walletIndex)!.address;
    const privateKeyNode = this.getPrivateKey();
    const privateKey = privateKeyNode.derivePath(
      "m/44'/0'/0'/0" + walletIndex
    ).privateKey;
    // let tx, hash = sendBitcoin(sourceAddress, to, amount, privateKey)
    // await WalletApi.enqueueTransaction(this.core.conduit!, 'ethereum', tx, hash);
  }

  async requestAddress(_event: any, network: string, from: string) {
    await WalletApi.requestAddress(this.core.conduit!, network, from);
  }

  async updateBitcoinInfo() {
    for (var key of this.state!.bitcoin.wallets.keys()) {
      const btcChain = this.state!.bitcoin.network === 'mainnet' ? 'btc/main' : 'btc/test3';
      let wallet = this.state!.bitcoin.wallets.get(key)!
      const url = `https://api.blockcypher.com/v1/${btcChain}/addrs/${wallet.address}`;
      const response: any = await axios.get(url, {
        headers: {
            'Content-Type': 'application/json'
        }
      })
      wallet.setBalance(response.data.balance.toString());
      wallet.applyTransactions(response.data.txrefs);
    }
  }

  async getAllBitcoinBalances() {
  }

  async getAllBitcoinTransactions() {
    const btcChain = this.state!.bitcoin.network === 'mainnet' ? 'bitcoin' : 'bitcoin/testnet'
    const url = `https://api.blockchair.com/${btcChain}/raw/block/{:height}`
  }

  setEthereumProviders() {
    var alchemySettings;
    if (this.state!.ethereum.network === 'mainnet') {
      this.ethProvider = new ethers.providers.JsonRpcProvider(
        'https://mainnet.infura.io/v3/4b0d979693764f9abd2e04cd197062da'
      );
      alchemySettings = {
        apiKey: 'gaAFkc10EtqPwZDCXAvMni8xgz9JnNmM', // Replace with your Alchemy API Key.
        network: Network.ETH_MAINNET, // Replace with your network.
      };
      // etherscan
    } else {
      this.ethProvider = new ethers.providers.JsonRpcProvider(
        'https://goerli.infura.io/v3/4b0d979693764f9abd2e04cd197062da'
      );
      alchemySettings = {
        apiKey: 'gaAFkc10EtqPwZDCXAvMni8xgz9JnNmM', // Replace with your Alchemy API Key.
        network: Network.ETH_GOERLI, // Replace with your network.
      };
    }
    this.ethProvider.removeAllListeners();
    this.ethProvider.on('block', () => this.updateEthereumInfo());
    this.alchemy = new Alchemy(alchemySettings);
  }

  updateEthereumInfo() {
    this.getAllEthereumBalances();
    this.getAllCoins();
    this.getAllNfts();
    this.getAllEthereumTransactions();
  }

  gweiToEther = (gwei: number) => {
    return gwei / 1000000000000000000;
  };

  async getAllEthereumBalances() {
    if (this.state!.navState.network === 'bitcoin') {
    } else if (this.state!.navState.network === 'ethereum') {
      for (var key of this.state!.ethereum.wallets.keys()) {
        let wallet: any = this.state!.ethereum.wallets.get(key);
        const balance = await this.ethProvider!.getBalance(wallet.address);
        wallet.setBalance(utils.formatEther(balance));
      }
    }
  }

  async getAllCoins() {
    for (var key of this.state!.ethereum.wallets.keys()) {
      let wallet: any = this.state!.ethereum.wallets.get(key);
      const balances = await this.alchemy!.core.getTokenBalances(
        wallet.address
      );
      // Remove tokens with zero balance
      const nonZeroBalances = balances.tokenBalances.filter((token: any) => {
        return token.tokenBalance !== '0';
      });
      var coins = [];
      for (let token of nonZeroBalances) {
        const metadata = await this.alchemy!.core.getTokenMetadata(
          (token as any).contractAddress
        );
        const contract = new ethers.Contract(
          (token as any).contractAddress,
          abi,
          this.ethProvider
        );
        let wallet: any = this.state!.ethereum.wallets.get(key);
        const balance = (await contract.balanceOf(wallet.address)).toString();
        const coin = {
          name: metadata.symbol!,
          logo: metadata.logo || '',
          contractAddress: (token as any).contractAddress,
          balance: balance,
          decimals: metadata.decimals!,
        };
        coins.push(coin);
      }
      this.state!.ethereum.wallets.get(key)!.setCoins(coins);
    }
  }

  async getAllNfts() {
    for (var key of this.state!.ethereum.wallets.keys()) {
      let wallet: any = this.state!.ethereum.wallets.get(key);
      const nfts = await this.alchemy!.nft.getNftsForOwner(wallet.address);
      var allNfts = [];
      for (let nft of nfts.ownedNfts) {
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
    }
    else if (this.state!.navState.network === 'bitcoin') {
      this.state!.setNetwork(NetworkType.BITCOIN_TESTNET);
      this.updateBitcoinInfo();
    }
    else if (this.state!.navState.network === 'btctestnet') {
      this.state!.setNetwork(NetworkType.BITCOIN);
      this.updateBitcoinInfo();
    }
  }

  async getAllEthereumTransactions() {
    // etherscan api call
    for (var key of this.state!.ethereum.wallets.keys()) {
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
