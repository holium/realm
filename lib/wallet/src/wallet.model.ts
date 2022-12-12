import { AssetTransfersCategory } from 'alchemy-sdk';
import {
  applySnapshot,
  types,
  Instance,
  getSnapshot,
  flow,
  cast,
} from 'mobx-state-tree';

export enum WalletView {
  LIST = 'list',
  NEW = 'new',
  WALLET_DETAIL = 'detail',
  TRANSACTION_DETAIL = 'transaction',
  NFT_DETAIL = 'ethereum:nft',
  LOCKED = 'locked',
  SETTINGS = 'settings',
  CREATE_WALLET = 'create-wallet',
}

const gweiToEther = (gwei: number) => {
  return gwei / 1000000000000000000;
};

export enum WalletCreationMode {
  DEFAULT = 'default',
  ON_DEMAND = 'on-demand',
}

export enum SharingMode {
  NOBODY = 'nobody',
  FRIENDS = 'friends',
  ANYBODY = 'anybody',
}

const Settings = types
  .model('Settings', {
    walletCreationMode: types.enumeration(Object.values(WalletCreationMode)),
    sharingMode: types.enumeration(Object.values(SharingMode)),
    defaultIndex: types.integer,
    provider: types.maybe(types.string),
  })
  .actions((self) => ({
    setWalletCreationMode(mode: WalletCreationMode) {
      self.walletCreationMode = mode;
    },
    setSharingMode(mode: SharingMode) {
      self.sharingMode = mode;
    },
    setDefaultIndex(index: number) {
      self.defaultIndex = index;
    },
    setProvider(provider: string) {
      self.provider = provider;
    },
  }));

export type SettingsType = Instance<typeof Settings>;
export interface UISettingsType {
  walletCreationMode: WalletCreationMode;
  sharingMode: SharingMode;
  blocked: string[];
  defaultIndex: number;
  provider: string;
}

export const WalletSettings = types.model('WalletSettings', {
  passcodeHash: types.string,
});

export enum NetworkType {
  ETHEREUM = 'ethereum',
  BITCOIN = 'bitcoin',
}
const Networks = types.enumeration(Object.values(NetworkType));

export enum ProtocolType {
  ETH_MAIN = 'Ethereum Mainnet',
  ETH_GORLI = 'Görli Testnet',
  BTC_MAIN = 'Bitcoin Mainnet',
  BTC_TEST = 'Bitcoin Testnet',
  UQBAR = 'Uqbar Network',
}
const Protocols = types.enumeration(Object.values(ProtocolType));

export type Asset = {
  addr: string; // smart contract address for eth
  id?: string; // chainId for eth, id for uqbar
  type: 'coin' | 'token' | 'multisig' | string;
  data: NFTAsset | CoinAsset | MultiAsset;
};

// ERC-20
export type CoinAsset = {
  logo: string | null; // url of token logo image
  symbol: string; // USDC, DAI, BNB, etc
  decimals: number; // 8 - used to convert to human readable number
  balance: number; // current account balance
  totalSupply: number; // total supply of the coin
  allowances: { [addr: string]: number };
};

// ERC-721
export type NFTAsset = {
  name: string;
  tokenId: string;
  description: string;
  image: string;
  transferable?: boolean;
  properties: { [key: string]: string | object };
};

// ERC-1155
export type MultiAsset = {
  name: string;
  decimals: number; // 8 - used to convert to human readable number
  description: string;
  image: string;
  balance: number; // current account balance
  properties: { [key: string]: string | object };
};

export const Transaction = types.model('Transaction', {
  hash: types.identifier,
  walletIndex: types.number,
  amount: types.string,
  network: types.enumeration(['ethereum', 'bitcoin']),
  ethType: types.maybe(types.string),
  type: types.enumeration(['sent', 'received']),

  initiatedAt: types.maybeNull(types.string),
  completedAt: types.maybeNull(types.string),

  ourAddress: types.string,
  theirPatp: types.maybeNull(types.string),
  theirAddress: types.string,

  status: types.enumeration(['pending', 'failed', 'succeeded']),
  failureReason: types.maybeNull(types.string),

  notes: types.string,
});

export type TransactionType = Instance<typeof Transaction>;

const BitcoinWallet = types
  .model('BitcoinWallet', {
    index: types.number,
    network: types.string,
    path: types.string,
    address: types.string,
    nickname: types.string,
    balance: types.string,
    transactions: types.map(types.map(Transaction)),
  })
  .actions((self) => ({
    setBalance(balance: string) {
      self.balance = balance;
    },
    applyTransactions(transactions: any) {},
  }));

export type BitcoinWalletType = Instance<typeof BitcoinWallet>;

const BitcoinStore = types
  .model('BitcoinStore', {
    block: types.number,
    wallets: types.map(BitcoinWallet),
    settings: Settings,
    conversions: types
      .model({
        usd: types.maybe(types.number),
        cad: types.maybe(types.number),
        euro: types.maybe(types.number),
      })
      .actions((self) => ({
        setUsd(usd: number) {
          self.usd = usd;
        },
      })),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.wallets).map(([key, wallet]) => ({
        key,
        nickname: wallet.nickname,
        address: wallet.address,
        balance: wallet.balance,
      }));
    },
  }))
  .actions((self) => ({
    initial(bitcoinWallets: any) {
      Object.entries(bitcoinWallets).forEach(([key, wallet]) => {
        const walletUpdate = {
          ...(wallet as any),
          key,
          transactions: {},
        };
        this.applyWalletUpdate(walletUpdate);
      });
    },
    // pokes
    setProvider(provider: string) {
      self.settings.provider = provider;
    },
    // updates
    applyWalletUpdate(wallet: any) {
      let walletObj;
      if (!self.wallets.has(wallet.key)) {
        walletObj = {
          index: Number(wallet.key),
          network: 'bitcoin',
          path: wallet.path,
          address: wallet.address,
          balance: '0',
          nickname: wallet.nickname,
          transactions: {},
        };
        const bitcoinWallet = BitcoinWallet.create(walletObj);
        self.wallets.set(wallet.key, bitcoinWallet);
      }
      for (const transaction in wallet.transactions) {
        //    self.wallets.get(wallet.key)!.applyTransactionUpdate(transaction);
      }
    },
    setExchangeRate(usd: number) {
      self.conversions.setUsd(usd);
    },
    setBlock(block: number) {
      self.block = block;
    },
  }));

export type BitcoinStoreType = Instance<typeof BitcoinStore>;

const ERC20 = types
  .model('ERC20', {
    name: types.string,
    logo: types.string,
    address: types.string,
    balance: types.string,
    decimals: types.number,
    conversions: types
      .model({
        usd: types.maybe(types.number),
        cad: types.maybe(types.number),
        euro: types.maybe(types.number),
      })
      .actions((self) => ({
        setUsd(usd: number) {
          self.usd = usd;
        },
      })),
  })
  .actions((self) => ({
    setBalance(balance: string) {
      self.balance = balance;
    },
    setExchangeRate(usd: number) {
      self.conversions.setUsd(usd);
    },
  }));

export type ERC20Type = Instance<typeof ERC20>;

const ERC721 = types.model('ERC721', {
  name: types.string,
  collectionName: types.maybe(types.string),
  address: types.string,
  tokenId: types.string,
  imageUrl: types.string,
  lastPrice: types.string,
  floorPrice: types.maybe(types.string),
});

export type ERC721Type = Instance<typeof ERC721>;

const EthWalletData = types
  .model('EthWalletData', {
    balance: types.string,
    coins: types.map(ERC20),
    nfts: types.map(ERC721),
    transactions: types.map(Transaction),
  })
  .actions((self) => ({
    setCoins(coins: any) {
      applySnapshot(self.coins, coins);
    },
  }));

const EthWallet = types
  .model('EthWallet', {
    index: types.number,
    network: types.string,
    path: types.string,
    address: types.string,
    nickname: types.string,
    data: types.map(EthWalletData),
  })
  .actions((self) => ({
    setCoins(protocol: ProtocolType, coins: any) {
      const formattedCoins: any = {};
      for (const Coin of coins) {
        const coin: any = Coin;
        formattedCoins[coin.contractAddress] = {
          name: coin.name,
          logo: coin.imageUrl || '',
          address: coin.contractAddress,
          balance: coin.balance,
          decimals: coin.decimals,
          conversions: {},
        };
      }
      const map = types.map(ERC20);
      const newCoins = map.create(formattedCoins);
      applySnapshot(self.data.get(protocol)!.coins, getSnapshot(newCoins));
    },
    setNFTs(protocol: ProtocolType, nfts: any) {
      const formattedNft: any = {};
      for (const NFT of nfts) {
        const nft: any = NFT;
        formattedNft[nft.contractAddress + nft.tokenId] = {
          name: nft.name,
          collectionName: nft.collectionName,
          address: nft.contractAddress,
          tokenId: nft.tokenId,
          imageUrl: nft.imageUrl,
          lastPrice: nft.price || '0',
        };
      }
      const map = types.map(ERC721);
      const newNft = map.create(formattedNft);
      applySnapshot(self.data.get(protocol)!.nfts, getSnapshot(newNft));
    },
    updateCoin(protocol: ProtocolType, coin: Asset) {
      const coinData = coin.data as CoinAsset;
      self.data.get(protocol)!.coins.set(coin.addr, {
        name: coinData.symbol,
        logo: coinData.logo || '',
        address: coin.addr,
        balance: coinData.balance.toString(),
        decimals: coinData.decimals,
        conversions: {},
      });
    },
    updateCoinTransfers(transfers: any) {},
    updateNft(protocol: ProtocolType, nft: Asset) {
      const nftData = nft.data as NFTAsset;
      self.data.get(protocol)!.nfts.set(nft.addr + nftData.tokenId, {
        name: nftData.name,
        collectionName: '',
        address: nft.addr,
        tokenId: nftData.tokenId,
        imageUrl: nftData.image,
        lastPrice: '',
      });
    },
    updateNftTransfers(transfers: any) {},
    setBalance(protocol: ProtocolType, balance: string) {
      self.data.get(protocol)!.balance = balance;
    },
    /*clearWallet() {
      self.coins.clear();
      self.nfts.clear();
    },*/
    /* applyHistory(history: any) {
      console.log(history);
      let formattedHistory: any = {};
      Object.entries(history).forEach(([key, transaction]) => {
        const tx = transaction as any;
        formattedHistory[tx.hash] = {
          hash: tx.hash,
          walletIndex: self.index,
          amount: tx.amount,
          network: 'ethereum',
          type: tx.type,
          initiatedAt: tx.initiatedAt,
          completedAt: tx.completedAt || '',
          ourAddress: tx.ourAddress,
          theirPatp: tx.theirPatp,
          theirAddress: tx.theirAddress,
          status: tx.status,
          failureReason: tx.failureReason || '',
          notes: tx.notes || '',
        };
      });
      console.log(formattedHistory);
      const map = types.map(EthTransaction);
      const newHistory = map.create(formattedHistory);
      applySnapshot(self.transactions, getSnapshot(newHistory));
    }, */
    getTransaction(protocol: ProtocolType, hash: string) {
      const tx: any = self.data.get(protocol)!.transactions.get(hash);
      return {
        hash: tx.hash,
        walletIndex: self.index,
        amount: tx.amount,
        network: tx.network,
        type: tx.type,
        'initiated-at': tx.initiatedAt,
        'completed-at': tx.completedAt || '',
        'our-address': tx.ourAddress,
        'their-patp': tx.theirPatp || '',
        'their-address': tx.theirAddress,
        status: tx.status,
        'failure-reason': tx.failureReason || '',
        notes: tx.notes || '',
      };
    },
    enqueueTransaction(
      protocol: ProtocolType,
      hash: any,
      toAddress: any,
      toPatp: any,
      from: string,
      amount: any,
      timestamp: any,
      contractType?: string
    ) {
      const tx = {
        hash,
        walletIndex: self.index,
        amount: gweiToEther(amount).toString(),
        network: 'ethereum',
        ethType: contractType || 'ETH',
        type: 'sent',
        initiatedAt: timestamp.toString(),
        ourAddress: from,
        theirAddress: toAddress,
        theirPatp: toPatp,
        status: 'pending',
        notes: '',
      };
      self.data.get(protocol)!.transactions.set(hash, tx);
    },
    applyTransactionUpdate(protocol: ProtocolType, transaction: any) {
      let netMap = self.data.get(protocol)!.transactions;
      const tx = netMap?.get(transaction.hash);
      if (tx) {
        tx.walletIndex = self.index;
        tx.notes = transaction.notes;
        netMap.set(transaction.hash, tx);
      } else {
        const tx = {
          ...transaction,
          walletIndex: self.index,
          amount: '0',
          notes: '',
        };
        netMap.set(transaction.hash, tx);
      }
    },
    applyTransactions(protocol: ProtocolType, transactions: any) {
      let formattedTransactions: any = {};
      let previousTransactions = self.data.get(protocol)!.transactions.toJSON();
      for (const transaction of transactions) {
        // console.log('applyTransaction', transaction);
        const previousTransaction = previousTransactions[transaction.hash];
        formattedTransactions[transaction.hash] = {
          hash: transaction.hash,
          walletIndex: self.index,
          amount: gweiToEther(transaction.value).toString(),
          network: 'ethereum',
          ethType: transaction.contractAddress || 'ETH',
          type: self.address === transaction.from ? 'sent' : 'received',
          initiatedAt: previousTransaction?.initiatedAt,
          completedAt: new Date(
            Number(transaction.timeStamp) * 1000
          ).toISOString(),
          ourAddress: transaction.from,
          theirPatp: previousTransaction?.theirPatp,
          theirAddress: transaction.to,
          status: transaction.txreceipt_status === '1' ? 'succeeded' : 'failed',
          failureReason: previousTransaction?.failureReason,
          notes: previousTransaction?.notes || '',
        };
        if (previousTransactions[transaction.hash]) {
          if (
            formattedTransactions[transaction.hash].status !==
            previousTransactions[transaction.hash].status
          ) {
            // WalletApi.setTransaction(transaction);
          }
        }
      }
      formattedTransactions = {
        ...previousTransactions,
        ...formattedTransactions,
      };
      const map = types.map(Transaction);
      const newTransactions = map.create(formattedTransactions);
      applySnapshot(
        self.data.get(protocol)!.transactions,
        getSnapshot(newTransactions)
      );
    },
  }));

export type EthWalletType = Instance<typeof EthWallet>;

export const EthStore = types
  .model('EthStore', {
    block: types.number,
    gorliBlock: types.number,
    protocol: Protocols,
    wallets: types.map(EthWallet),
    settings: Settings,
    initialized: types.boolean,
    conversions: types
      .model({
        usd: types.maybe(types.number),
        cad: types.maybe(types.number),
        euro: types.maybe(types.number),
      })
      .actions((self) => ({
        setUsd(usd: number) {
          self.usd = usd;
        },
      })),
  })
  .views((self) => ({
    get list() {
      return Array.from(self.wallets).map(([key, wallet]) => ({
        key,
        nickname: wallet.nickname,
        address: wallet.address,
        balance: wallet.data.get(self.protocol)!.balance,
      }));
    },
  }))
  .actions((self) => ({
    initial(wallets: any) {
      const ethWallets = wallets.ethereum;
      Object.entries(ethWallets).forEach(([key, wallet]) => {
        const walletUpdate = {
          ...(wallet as any),
          key,
          data: {
            coins: {},
            nfts: {},
            transactions: {},
          },
        };
        this.applyWalletUpdate(walletUpdate);
      });
    },
    // pokes
    setProvider(provider: string) {
      self.settings.provider = provider;
    },
    setDefaultWallet(index: number) {
      self.settings.defaultIndex = index;
    },
    applyWalletUpdate: flow(function* (wallet: any) {
      let walletObj;
      if (!self.wallets.has(wallet.key)) {
        walletObj = {
          index: Number(wallet.key),
          network: 'ethereum',
          path: wallet.path,
          address: wallet.address,
          nickname: wallet.nickname,
          data: {
            [ProtocolType.ETH_MAIN]: {
              balance: '0',
              coins: {},
              nfts: {},
              transactions: {},
            },
            [ProtocolType.ETH_GORLI]: {
              balance: '0',
              coins: {},
              nfts: {},
              transactions: {},
            },
            [ProtocolType.UQBAR]: {
              balance: '0',
              coins: {},
              nfts: {},
              transactions: {},
            },
          },
        };
        const ethWallet = EthWallet.create(walletObj);
        self.wallets.set(wallet.key, ethWallet);
      }
      for (const protocol of Object.keys(wallet.transactions)) {
        const protocolTransactions = wallet.transactions[protocol];
        for (const transactionKey of Object.keys(protocolTransactions)) {
          const transaction = protocolTransactions[transactionKey];
          self.wallets
            .get(wallet.key)!
            .applyTransactionUpdate(protocol as ProtocolType, transaction);
        }
      }
    }),
    setProtocol(protocol: ProtocolType) {
      self.protocol = protocol;
      self.wallets.forEach((wallet: any) => (wallet.protocol = protocol));
    },
    deleteWallets() {
      self.wallets.clear();
    },
    setSettings(settings: SettingsType) {
      self.settings = settings;
    },
    setExchangeRate(usd: number) {
      self.conversions.setUsd(usd);
    },
    setBlock(block: number) {
      self.block = block;
    },
  }));
export type EthStoreType = Instance<typeof EthStore>;

export enum NetworkStoreType {
  ETHEREUM = 'Ethereum',
  BTC_MAIN = 'Bitcoin Mainnet',
  BTC_TEST = 'Bitcoin Testnet',
}
const NetworkStores = types.enumeration(Object.values(NetworkStoreType));

export const WalletNavState = types
  .model('WalletNavState', {
    view: types.enumeration(Object.values(WalletView)),
    protocol: Protocols,
    lastEthProtocol: Protocols,
    btcNetwork: NetworkStores,
    walletIndex: types.maybe(types.string),
    detail: types.maybe(
      types.model({
        type: types.enumeration(['transaction', 'coin', 'nft']),
        key: types.string,
      })
    ),
    action: types.maybe(
      types.model({
        type: types.string,
        data: types.frozen(),
      })
    ),
  })
  .views((self) => ({
    get network(): NetworkType {
      switch (self.protocol) {
        case ProtocolType.ETH_MAIN:
          return NetworkType.ETHEREUM;
        case ProtocolType.ETH_GORLI:
          return NetworkType.ETHEREUM;
        case ProtocolType.UQBAR:
          return NetworkType.ETHEREUM;
        case ProtocolType.BTC_MAIN:
          return NetworkType.BITCOIN;
        case ProtocolType.BTC_TEST:
          return NetworkType.BITCOIN;
        default:
          return NetworkType.ETHEREUM;
      }
    },
    get networkStore(): NetworkStoreType {
      switch (self.protocol) {
        case ProtocolType.ETH_MAIN:
          return NetworkStoreType.ETHEREUM;
          break;
        case ProtocolType.ETH_GORLI:
          return NetworkStoreType.ETHEREUM;
          break;
        case ProtocolType.UQBAR:
          return NetworkStoreType.ETHEREUM;
          break;
        case ProtocolType.BTC_MAIN:
          return NetworkStoreType.BTC_MAIN;
          break;
        case ProtocolType.BTC_TEST:
          return NetworkStoreType.BTC_TEST;
          break;
        default:
          return NetworkStoreType.ETHEREUM;
          break;
      }
    },
  }));
export type WalletNavStateType = Instance<typeof WalletNavState>;

export interface WalletNavOptions {
  canReturn?: boolean;
  network?: NetworkType;
  networkStore?: NetworkStoreType;
  protocol?: ProtocolType;
  lastEthProtocol?: ProtocolType;
  walletIndex?: string;
  detail?: {
    type: 'transaction' | 'coin' | 'nft';
    key: string;
  };
  action?: {
    type: string;
    data: any;
  };
}

export const WalletStore = types
  .model('WalletStore', {
    returnView: types.maybe(types.enumeration(Object.values(WalletView))),
    ethereum: EthStore,
    bitcoin: BitcoinStore,
    btctest: BitcoinStore,
    creationMode: types.string,
    sharingMode: types.string,
    whitelist: types.map(types.string),
    blacklist: types.array(types.string),
    ourPatp: types.maybe(types.string),
    passcodeHash: types.maybe(types.string),
    lastInteraction: types.Date,
    initialized: types.boolean,
    navState: WalletNavState,
    navHistory: types.array(WalletNavState),
    settings: WalletSettings,
  })
  .views((self) => ({
    get currentStore() {
      // return self.[self.navState.networkStore];
      switch (self.navState.networkStore) {
        case NetworkStoreType.ETHEREUM:
          return self.ethereum;
        case NetworkStoreType.BTC_MAIN:
          return self.bitcoin;
        case NetworkStoreType.BTC_MAIN:
          return self.btctest;
        default:
          return self.ethereum;
      }
    },

    get currentWallet() {
      const walletStore = this.currentStore;
      return self.navState.walletIndex
        ? walletStore.wallets.get(self.navState.walletIndex)
        : null;
    },
  }))
  .actions((self) => ({
    setInitialized(initialized: boolean) {
      self.initialized = initialized;
    },
    setNetwork(network: NetworkType) {
      /* @ts-expect-error */
      self.resetNavigation();
      if (network !== self.navState.network) {
        switch (network) {
          case NetworkType.ETHEREUM:
            self.navState.protocol = self.ethereum.protocol;
            break;
          case NetworkType.BITCOIN:
            self.navState.protocol =
              self.navState.btcNetwork === NetworkStoreType.BTC_MAIN
                ? ProtocolType.BTC_MAIN
                : ProtocolType.BTC_TEST;
            break;
        }
      }
    },
    setProtocol(protocol: ProtocolType) {
      /* @ts-expect-error */
      self.resetNavigation();
      if (protocol === ProtocolType.UQBAR) {
        self.navState.lastEthProtocol =
          self.navState.protocol === ProtocolType.UQBAR
            ? ProtocolType.ETH_MAIN
            : self.navState.protocol;
      }
      self.navState.protocol = protocol;
      self.ethereum.setProtocol(protocol);
    },
    navigate(view: WalletView, options?: WalletNavOptions) {
      const canReturn = options?.canReturn || true;
      const walletIndex = options?.walletIndex || self.navState.walletIndex;
      const detail = options?.detail;
      const action = options?.action;
      const protocol = options?.protocol || self.navState.protocol;
      const lastEthProtocol =
        options?.lastEthProtocol || self.navState.lastEthProtocol;

      if (
        canReturn &&
        ![WalletView.LOCKED, WalletView.NEW].includes(self.navState.view)
      ) {
        const returnSnapshot = getSnapshot(self.navState);
        self.navHistory.push(WalletNavState.create(returnSnapshot));
      }

      const newState = WalletNavState.create({
        view,
        walletIndex,
        detail,
        action,
        protocol,
        lastEthProtocol,
        btcNetwork: self.navState.btcNetwork,
      });
      self.navState = newState;
    },
    navigateBack() {
      const DEFAULT_RETURN_VIEW = WalletView.LIST;
      let returnSnapshot = getSnapshot(
        WalletNavState.create({
          view: DEFAULT_RETURN_VIEW,
          protocol: self.navState.protocol,
          lastEthProtocol: self.navState.lastEthProtocol,
          btcNetwork: self.navState.btcNetwork,
        })
      );

      if (self.navHistory.length) {
        returnSnapshot = getSnapshot(self.navHistory.pop()!);
      }

      self.navState = WalletNavState.create(returnSnapshot);
    },
    resetNavigation() {
      self.navState = WalletNavState.create({
        view: WalletView.LIST,
        protocol: self.navState.protocol,
        lastEthProtocol: self.navState.lastEthProtocol,
        btcNetwork: self.navState.btcNetwork,
      });
      self.navHistory = cast([]);
    },
    setReturnView(view: WalletView) {
      self.returnView = view;
    },
    setNetworkProvider(provider: string) {
      self.currentStore.setProvider(provider);
    },
    setPasscodeHash(hash: string) {
      self.passcodeHash = hash;
    },
    setLastInteraction(date: Date) {
      self.lastInteraction = date;
    },
    setSettings(settings: any) {
      self.settings.passcodeHash = settings.passcodeHash;
      self.blacklist = settings.blocked;
      for (let network of Object.keys(settings.networks)) {
        const store =
          network === 'ethereum'
            ? self.ethereum
            : network === 'bitcoin'
            ? self.bitcoin
            : self.btctest;
        const netSettings = settings.networks[network];
        store.settings.setDefaultIndex(netSettings.defaultIndex);
        store.settings.setWalletCreationMode(netSettings.walletCreationMode);
        store.settings.setSharingMode(netSettings.sharingMode);
      }
    },
  }));

export type WalletStoreType = Instance<typeof WalletStore>;
