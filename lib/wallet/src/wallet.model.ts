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

const Settings = types.model('Settings', {
  walletCreationMode: types.enumeration(Object.values(WalletCreationMode)),
  sharingMode: types.enumeration(Object.values(SharingMode)),
  blocked: types.array(types.string),
  defaultIndex: types.integer,
  provider: types.maybe(types.string),
});

export type SettingsType = Instance<typeof Settings>;
export interface UISettingsType {
  walletCreationMode: WalletCreationMode;
  sharingMode: SharingMode;
  blocked: string[];
  defaultIndex: number;
  provider: string;
}

export const WalletSettings = types
  .model('WalletSettings', {
    networkSettings: types.map(Settings),
    passcodeHash: types.string,
  })

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

export const BitcoinTransaction = types.model('BitcoinTransaction', {
  hash: types.identifier,
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

export type BitcoinTransactionType = Instance<typeof BitcoinTransaction>;

const BitcoinWallet = types
  .model('BitcoinWallet', {
    index: types.number,
    network: types.string,
    path: types.string,
    address: types.string,
    nickname: types.string,
    balance: types.string,
    transactions: types.map(types.map(BitcoinTransaction)),
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
      console.log('applyWalletUpdate', wallet);
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
        console.log(self.wallets);
        const bitcoinWallet = BitcoinWallet.create(walletObj);
        console.log(wallet.key);
        self.wallets.set(wallet.key, bitcoinWallet);
      }
      for (const transaction in wallet.transactions) {
        //    self.wallets.get(wallet.key)!.applyTransactionUpdate(transaction);
      }
    },
    setExchangeRate(usd: number) {
      self.conversions.setUsd(usd);
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

// const ERC721Token = types
//   .model('ERC721Token', {
//     name: types.string,
//     // collection name - null if single
//     // last price or floor price
//     imageUrl: types.string,
//     tokenId: types.number,
//   })
// const ERC721Token = types
//   .model('ERC721Token', {
//     name: types.string,
//     imageUrl: types.string,
//     tokenId: types.string,
//   })

// const ERC721 = types.model('ERC721', {
//   name: types.string,
//   address: types.string,
//   tokens: types.map(ERC721Token),//types.map(types.number),
// });

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

export const EthTransaction = types.model('EthTransaction', {
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

export type TransactionType = Instance<typeof EthTransaction>;

const EthWallet = types
  .model('EthWallet', {
    index: types.number,
    network: types.string,
    path: types.string,
    address: types.string,
    balance: types.string,
    coins: types.map(ERC20),
    nfts: types.map(ERC721),
    nickname: types.string,
    transactions: types.map(types.map(EthTransaction)),
  })
  .actions((self) => ({
    addSmartContract(
      contractType: string,
      name: string,
      contractAddress: string,
      decimals: number
    ) {
      /* if (contractType === 'erc721') {
        *const contract = ERC721.create({
          name: name,
          collectionName: '',
          address: contractAddress,
          tokenId: 0,
          imageUrl: '',
          lastPrice: '',
          floorPrice: '',
        })
        self.nfts.set(contract.address, contract);
      } */
      if (contractType === 'erc20') {
        const contract = ERC20.create({
          name,
          logo: '',
          address: contractAddress,
          balance: '0',
          decimals,
          conversions: {},
        });
        self.coins.set(contract.address, contract);
      }
    },
    setCoins(coins: any) {
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
      applySnapshot(self.coins, getSnapshot(newCoins));
    },
    setNFTs(nfts: any) {
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
      applySnapshot(self.nfts, getSnapshot(newNft));
    },
    setBalance(balance: string) {
      self.balance = balance;
    },
    clearWallet() {
      self.coins.clear();
      self.nfts.clear();
    },
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
    getTransaction(network: string, hash: string) {
      const tx: any = self.transactions.get(network)!.get(hash);
      console.log(tx);
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
      network: string,
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
      const netMap =
        self.transactions.get(network)?.toJSON() ||
        types.map(EthTransaction).create().toJSON();
      const newMap = {
        ...netMap,
        [hash]: tx,
      };
      self.transactions.set(
        network,
        getSnapshot(types.map(EthTransaction).create(newMap))
      );
    },
    applyTransactionUpdate(network: string, transaction: any) {
      let netMap = self.transactions.get(network);
      if (!netMap) {
        self.transactions.set(network, {});
      }
      netMap = self.transactions.get(network)!;
      const tx = netMap?.get(transaction.hash);
      console.log('applying update');
      if (tx) {
        tx.walletIndex = self.index;
        tx.notes = transaction.notes;
        netMap.set(transaction.hash, tx);
        self.transactions.set(network, netMap);
      } else {
        const tx = {
          ...transaction,
          walletIndex: self.index,
          amount: '0',
          notes: '',
        };
        netMap.set(transaction.hash, tx);
        self.transactions.set(network, netMap);
      }
    },
    applyTransactions(network: string, transactions: any) {
      let formattedTransactions: any = {};
      let previousTransactions = self.transactions.toJSON()[network];
      if (!previousTransactions) self.transactions.set(network, {});
      previousTransactions = self.transactions.toJSON()[network];
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
            //            WalletApi.setTransaction(transaction);
          }
        }
      }
      formattedTransactions = {
        ...previousTransactions,
        ...formattedTransactions,
      };
      formattedTransactions = {
        [network]: formattedTransactions,
      };
      const map = types.map(types.map(EthTransaction));
      const newTransactions = map.create(formattedTransactions);
      applySnapshot(self.transactions, getSnapshot(newTransactions));
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
        balance: wallet.balance,
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
          coins: {},
          nfts: {},
          transactions: {},
        };
        this.applyWalletUpdate(self.protocol, walletUpdate);
      });
    },
    // pokes
    setProvider(provider: string) {
      self.settings.provider = provider;
    },
    setDefaultWallet(index: number) {
      self.settings.defaultIndex = index;
    },
    applyWalletUpdate: flow(function* (network: string, wallet: any) {
      let walletObj;
      if (!self.wallets.has(wallet.key)) {
        walletObj = {
          index: Number(wallet.key),
          network: 'ethereum',
          path: wallet.path,
          address: wallet.address,
          balance: '0',
          coins: {},
          nfts: {},
          nickname: wallet.nickname,
          transactions: {},
        };
        console.log(self.wallets);
        const ethWallet = EthWallet.create(walletObj);
        console.log(wallet.key);
        self.wallets.set(wallet.key, ethWallet);
      }
      for (const transaction in wallet.transactions) {
        self.wallets
          .get(wallet.key)!
          .applyTransactionUpdate(network, transaction);
      }
    }),
    setProtocol(protocol: ProtocolType) {
      self.protocol = protocol;
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
  }));
export type EthStoreType = Instance<typeof EthStore>;



export enum NetworkStoreType {
  ETHEREUM = 'Ethereum',
  BTC_MAIN = 'Bitcoin Mainnet',
  BTC_TEST = 'Bitcoin Testnet',
}
const NetworkStores = types.enumeration(Object.values(NetworkStoreType));

export const WalletNavState = types.model('WalletNavState', {
  view: types.enumeration(Object.values(WalletView)),
  network: Networks,
  networkStore: NetworkStores,
  protocol: Protocols,
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
});
export type WalletNavStateType = Instance<typeof WalletNavState>;

export interface WalletNavOptions {
  canReturn?: boolean;
  network?: NetworkType;
  networkStore?: NetworkStoreType;
  protocol?: ProtocolType;
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
      if (network !== self.navState.network) {
        switch (network) {
          case NetworkType.ETHEREUM:
            self.navState.networkStore = NetworkStoreType.ETHEREUM
            self.navState.protocol = self.ethereum.protocol;
            this.setProtocol
            break;
          case NetworkType.BITCOIN:
            self.navState.networkStore = self.navState.btcNetwork;
            self.navState.protocol = self.navState.btcNetwork === NetworkStoreType.BTC_MAIN
            ? ProtocolType.BTC_MAIN
            : ProtocolType.BTC_TEST
            break;
        }
      }
      self.navState.network = network;
      /* @ts-expect-error */
      self.resetNavigation();
    },
    setProtocol(protocol: ProtocolType) {
      self.navState.protocol = protocol;
      /* @ts-expect-error */
      self.resetNavigation();
    },
    navigate(view: WalletView, options?: WalletNavOptions) {
      const canReturn = options?.canReturn || true;
      const walletIndex = options?.walletIndex || self.navState.walletIndex;
      const detail = options?.detail;
      const action = options?.action;
      const network = options?.network || self.navState.network;
      const networkStore = options?.networkStore || self.navState.networkStore;
      const protocol = options?.protocol || self.navState.protocol;

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
        network,
        networkStore,
        protocol,
        btcNetwork: self.navState.btcNetwork,
      });
      self.navState = newState;
    },
    navigateBack() {
      const DEFAULT_RETURN_VIEW = WalletView.LIST;
      let returnSnapshot = getSnapshot(
        WalletNavState.create({
          view: DEFAULT_RETURN_VIEW,
          network: self.navState.network,
          networkStore: self.navState.networkStore,
          protocol: self.navState.protocol,
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
        network: self.navState.network,
        networkStore: self.navState.networkStore,
        protocol: self.navState.protocol,
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
      self.sharingMode = settings.sharingMode;
      self.creationMode = settings.walletCreationMode;
    }
  }));

export type WalletStoreType = Instance<typeof WalletStore>;
