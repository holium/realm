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
  SettingsType,
} from './wallet.model';
import EncryptedStore from '../../lib/encryptedStore';
import { Network, Alchemy, AssetTransfersCategory } from 'alchemy-sdk';
// @ts-expect-error
import abi from 'human-standard-token-abi';
// @ts-expect-error
import nftabi from 'non-fungible-token-abi';
import axios from 'axios';
// @ts-expect-error
import bitcore from 'bitcore-lib';

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
    'realm.tray.wallet.check-passcode': this.checkPasscode,
    'realm.tray.wallet.check-provider-url': this.checkProviderUrl,
    'realm.tray.wallet.toggle-network': this.toggleNetwork,
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

    WalletApi.subscribeToWallets(this.core.conduit!, async (wallet: any) => {
      if (wallet.network === 'ethereum') {
        this.state!.ethereum.applyWalletUpdate(
          this.state!.ethereum.network,
          wallet
        );
        this.updateEthereumInfo();
      } else if (wallet.network === 'bitcoin') {
        this.state!.bitcoin.applyWalletUpdate(wallet);
        this.updateBitcoinInfo();
      } else if (wallet.network === 'btctestnet') {
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
      // this.updateBitcoinInfo();
    });

    // WalletApi.subscribeToTransactions(
    //   this.core.conduit!,
    //   (transaction: any) => {
    //     if (transaction.network == 'ethereum')
    //       this.state!.ethereum.wallets.get(
    //         transaction.index
    //       )!.applyTransactionUpdate(transaction.net, transaction.transaction);
    //     //      else if (transaction.network == 'bitcoin')
    //     //        this.state!.bitcoin.applyTransactionUpdate(transaction);
    //     /* const tx = this.state!.ethereum.transactions.get(
    //       transaction.transaction.hash
    //     ); */
    //   }
    // );

    WalletApi.getSettings(this.core.conduit!).then((settings: any) => {
      this.state!.ethereum.setSettings(settings);
    });

    this.setNetworkProvider(
      null,
      'ethereum',
      'https://eth-goerli.g.alchemy.com/v2/-_e_mFsxIOs5-mCgqZhgb-_FYZFUKmzw'
      // 'https://goerli.infura.io/v3/e178fbf3fd694b1e8b29b110776749ce'
      // 'http://127.0.0.1:8545'
    );

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
    // TODO: implement
    return true;
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

  async setXpub(_event: any) {
    const ethPath = "m/44'/60'/0'";
    const btcPath = "m/44'/0'/0'";
    const btcTestnetPath = "m/44'/1'/0'";
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

  async updateBitcoinInfo() {
    const btcStore =
      this.state!.navState.btcNetwork === 'mainnet'
        ? this.state!.bitcoin
        : this.state!.testnet;
    for (const key of btcStore.wallets.keys()) {
      const btcChain =
        this.state!.navState.btcNetwork === 'mainnet'
          ? 'btc/main'
          : 'btc/test3';
      const wallet = btcStore.wallets.get(key)!;
      const url = `https://api.blockcypher.com/v1/${btcChain}/addrs/${wallet.address}`;
      console.log(url);
      const response: any = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      wallet.setBalance(response.data.balance.toString());
      wallet.applyTransactions(response.data.txrefs);
    }
    this.state!.bitcoin.setExchangeRate(await this.getBitcoinExchangeRate());
  }

  async getAllBitcoinBalances() {}

  async getAllBitcoinTransactions() {
    const btcChain =
      this.state!.navState.btcNetwork === 'mainnet'
        ? 'bitcoin'
        : 'bitcoin/testnet';
    const url = `https://api.blockchair.com/${btcChain}/raw/block/{:height}`;
  }

  setEthereumProviders() {
    let alchemySettings;
    if (this.state!.ethereum.network === 'mainnet') {
      // this.ethProvider = new ethers.providers.JsonRpcProvider(
      //   'https://mainnet.infura.io/v3/4b0d979693764f9abd2e04cd197062da'
      // );
      alchemySettings = {
        apiKey: 'gaAFkc10EtqPwZDCXAvMni8xgz9JnNmM', // Replace with your Alchemy API Key.
        network: Network.ETH_MAINNET, // Replace with your network.
      };
      // etherscan
    } else {
      this.ethProvider = new ethers.providers.JsonRpcProvider(
        'https://eth-goerli.g.alchemy.com/v2/-_e_mFsxIOs5-mCgqZhgb-_FYZFUKmzw'
      );
      alchemySettings = {
        apiKey: 'gaAFkc10EtqPwZDCXAvMni8xgz9JnNmM', // Replace with your Alchemy API Key.
        network: Network.ETH_GOERLI, // Replace with your network.
      };
    }
    this.ethProvider?.removeAllListeners();
    // TODO this is where the apis are querying too much
    // this.ethProvider?.on('block', () => this.updateEthereumInfo());
    this.alchemy = new Alchemy(alchemySettings);
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

  private async createBitcoinTransaction(
    senderPath: string,
    receiverAddress: string,
    amountToSend: number
  ) {
    const sochain_network = 'BTCTEST';
    const privateKey = this.getPrivateKey().derivePath(senderPath).privateKey;
    const sourceAddress = this.getPrivateKey().derivePath(senderPath).address;
    const satoshiToSend = amountToSend * 100000000;
    let fee = 0;
    let inputCount = 0;
    const outputCount = 2;
    const utxos = await axios.get(
      `https://sochain.com/api/v2/get_tx_unspent/${sochain_network}/${sourceAddress}`
    );
    const transaction = new bitcore.Transaction();
    let totalAmountAvailable = 0;
    const inputs: any = [];
    utxos.data.data.txs.forEach(async (element: any) => {
      const utxo: any = {};
      utxo.satoshis = Math.floor(Number(element.value) * 100000000);
      utxo.script = element.script_hex;
      utxo.address = utxos.data.data.address;
      utxo.txId = element.txid;
      utxo.outputIndex = element.output_no;
      totalAmountAvailable += utxo.satoshis;
      inputCount += 1;
      inputs.push(utxo);
    });
    const transactionSize: number =
      inputCount * 146 + outputCount * 34 + 10 - inputCount;
    fee = transactionSize * 20;
    if (totalAmountAvailable - satoshiToSend - fee < 0) {
      throw new Error('Balance is too low for this transaction');
    }
    transaction.from(inputs);
    transaction.to(receiverAddress, satoshiToSend);
    transaction.change(sourceAddress);
    transaction.fee(fee * 20);
    transaction.sign(privateKey);
    const serializedTransaction = transaction.serialize();
    const result = await axios({
      method: 'POST',
      url: `https://sochain.com/api/v2/send_tx/${sochain_network}`,
      data: {
        tx_hex: serializedTransaction,
      },
    });
    return result.data.data;
  }
}
