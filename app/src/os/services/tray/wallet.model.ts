import {
  applySnapshot,
  types,
  Instance,
  getSnapshot,
  flow,
  cast,
} from 'mobx-state-tree';
import { Network, Alchemy, Nft } from 'alchemy-sdk';
import { IntelligentTieringAccessTier } from 'aws-sdk/clients/s3';
import { TransactionDescription } from 'ethers/lib/utils';
import { WalletApi } from 'os/api/wallet';

const alchemySettings = {
  apiKey: 'gaAFkc10EtqPwZDCXAvMni8xgz9JnNmM', // Replace with your Alchemy API Key.
  network: Network.ETH_GOERLI, // Replace with your network.
};

const alchemy = new Alchemy(alchemySettings);

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
export type UISettingsType = {
  walletCreationMode: WalletCreationMode;
  sharingMode: SharingMode;
  blocked: string[];
  defaultIndex: number;
  provider: string;
};

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

const BitcoinWallet = types.model('BitcoinWallet', {
  index: types.number,
  network: types.string,
  path: types.string,
  address: types.string,
  nickname: types.string,
  balance: types.string,
  conversions: types.maybe(
    types.model({
      usd: types.maybe(types.string),
      cad: types.maybe(types.string),
      euro: types.maybe(types.string),
    })
  ),
  transactions: types.map(BitcoinTransaction),
});

export type BitcoinWalletType = Instance<typeof BitcoinWallet>;

const BitcoinStore = types
  .model('BitcoinStore', {
    network: types.enumeration(['mainnet', 'testnet']),
    wallets: types.map(BitcoinWallet),
    settings: Settings,
  })
  .views((self) => ({
    get list() {
      return Array.from(self.wallets).map(([key, wallet]) => ({
        key: key,
        nickname: wallet.nickname,
        address: wallet.address,
        balance: wallet.balance,
      }));
    },
  }))
  .actions((self) => ({
    initial(wallets: any) {
      const bitcoinWallets = wallets.bitcoin;
      Object.entries(bitcoinWallets).forEach(([key, wallet]) => {
        const walletUpdate = {
          ...(wallet as any),
          key: key,
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
      var walletObj;
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
      for (var transaction in wallet.transactions) {
    //    self.wallets.get(wallet.key)!.applyTransactionUpdate(transaction);
      }
    },
    setNetwork(network: string) {
      self.network = network;
    },
  }));

const ERC20 = types
  .model('ERC20', {
    name: types.string,
    logo: types.string,
    address: types.string,
    balance: types.string,
    decimals: types.number,
  })
  .actions((self) => ({
    setBalance(balance: string) {
      self.balance = balance;
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
    conversions: types.maybe(
      types.model({
        usd: types.maybe(types.string),
        cad: types.maybe(types.string),
        euro: types.maybe(types.string),
      })
    ),
    transactions: types.map(EthTransaction),
  })
  .actions((self) => ({
    addSmartContract(
      contractType: string,
      name: string,
      contractAddress: string,
      decimals: number
    ) {
      /*if (contractType === 'erc721') {
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
      }*/
      if (contractType === 'erc20') {
        const contract = ERC20.create({
          name: name,
          logo: '',
          address: contractAddress,
          balance: '0',
          decimals: decimals,
        });
        self.coins.set(contract.address, contract);
      }
    },
    setCoins(coins: any) {
      var formattedCoins: any = {};
      for (var Coin of coins) {
        const coin: any = Coin;
        formattedCoins[coin.contractAddress] = {
          name: coin.name,
          logo: coin.imageUrl || '',
          address: coin.contractAddress,
          balance: coin.balance,
          decimals: coin.decimals,
        };
      }
      const map = types.map(ERC20);
      const newCoins = map.create(formattedCoins);
      applySnapshot(self.coins, getSnapshot(newCoins));
    },
    setNFTs(nfts: any) {
      var formattedNft: any = {};
      for (var NFT of nfts) {
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
    applyHistory(history: any) {
      console.log(history);
      let formattedHistory: any = {};
      Object.entries(history).forEach(([key, transaction]) => {
        const tx = transaction as any;
        formattedHistory[tx.hash] = {
          hash: tx.hash,
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
    },
    getTransaction(hash: string) {
      const tx: any = self.transactions.get(hash);
      return {
        hash: tx.hash,
        amount: tx.amount,
        network: tx.network,
        type: tx.type,
        'initiated-at': tx.initiatedAt,
        'completed-at': tx.completedAt || 1,
        'our-address': tx.ourAddress,
        'their-patp': tx.theirPatp || 1,
        'their-address': tx.theirAddress,
        status: tx.status,
        'failure-reason': tx.failureReason || 1,
        notes: tx.notes,
      };
    },
    enqueueTransaction(
      hash: any,
      toAddress: any,
      toPatp: any,
      from: string,
      amount: any,
      timestamp: any,
      contractType?: string
    ) {
      let tx = {
        hash: hash,
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
      self.transactions.set(hash, tx);
    },
    applyTransactionUpdate(transaction: any) {
      let tx = self.transactions.get(transaction.hash);
      console.log('applying update')
      if (tx) {
        tx.notes = transaction.notes;
        self.transactions.set(transaction.hash, tx);
      }
      else {
        self.transactions.set(transaction.hash, transaction);
      }
    },
    applyTransactions(transactions: any) {
      var formattedTransactions: any = {};
      const previousTransactions = self.transactions.toJSON();
      for (var transaction of transactions) {
        const previousTransaction = previousTransactions[transaction.hash];
        formattedTransactions[transaction.hash] = {
          hash: transaction.hash,
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
          status: transaction.txreceipt_status === 1 ? 'succeeded' : 'failed',
          failureReason: previousTransaction?.failureReason,
          notes: previousTransaction ? previousTransaction.notes : '',
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
      const map = types.map(EthTransaction);
      const newTransactions = map.create(formattedTransactions);
      applySnapshot(self.transactions, getSnapshot(newTransactions));
    },
  }));

export type EthWalletType = Instance<typeof EthWallet>;

export const EthStore = types
  .model('EthStore', {
    network: types.enumeration(['mainnet', 'gorli']),
    wallets: types.map(EthWallet),
    settings: Settings,
    initialized: types.boolean,
  })
  .views((self) => ({
    get list() {
      return Array.from(self.wallets).map(([key, wallet]) => ({
        key: key,
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
          key: key,
          coins: {},
          nfts: {},
          transactions: {},
        };
        this.applyWalletUpdate(walletUpdate);
      });
    },
    // pokes
    setProvider(provider: string) {
      self.settings.provider = provider;
    },
    setDefaultWallet(index: number) {
      self.settings!.defaultIndex = index;
    },
    applyWalletUpdate: flow(function* (wallet: any) {
      var walletObj;
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
      for (var transaction in wallet.transactions) {
        self.wallets.get(wallet.key)!.applyTransactionUpdate(transaction);
      }
    }),
    setNetwork(network: string) {
      self.network = network;
    },
    deleteWallets() {
      self.wallets.clear();
    },
    setSettings(settings: SettingsType) {
      self.settings = settings;
    },
  }));

export enum NetworkType {
  ETHEREUM = 'ethereum',
  BITCOIN = 'bitcoin',
}
const Networks = types.enumeration(Object.values(NetworkType));

export const WalletNavState = types.model('WalletNavState', {
  view: types.enumeration(Object.values(WalletView)),
  network: Networks,
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

export interface WalletNavOptions {
  canReturn?: boolean;
  network?: NetworkType;
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
    network: types.enumeration(['ethereum', 'bitcoin']),
    currentView: types.enumeration(Object.values(WalletView)),
    returnView: types.maybe(types.enumeration(Object.values(WalletView))),
    currentItem: types.maybe(
      types.model({
        type: types.enumeration(['transaction', 'coin', 'nft']),
        key: types.string,
      })
    ),
    currentTransaction: types.maybe(types.string),
    bitcoin: BitcoinStore,
    ethereum: EthStore,
    creationMode: types.string,
    sharingMode: types.string,
    whitelist: types.map(types.string),
    blacklist: types.map(types.string),
    ourPatp: types.maybe(types.string),
    currentAddress: types.maybe(types.string),
    currentIndex: types.maybe(types.string),
    passcodeHash: types.maybe(types.string),
    lastInteraction: types.Date,
    initialized: types.boolean,
    navState: WalletNavState,
    navHistory: types.array(WalletNavState),
  })
  .views((self) => ({
    get currentStore() {
      return self.navState.network === 'ethereum'
        ? self.ethereum
        : self.bitcoin;
    },

    get currentWallet() {
      let walletStore =
        self.navState.network === 'ethereum' ? self.ethereum : self.bitcoin;
      return self.navState.walletIndex
        ? walletStore.wallets.get(self.navState.walletIndex)
        : null;
    },
  }))
  .actions((self) => ({
    setInitial(network: 'bitcoin' | 'ethereum', wallets: any) {
      if (network === 'ethereum') {
        self.ethereum.initial(wallets);
      }
      self.currentView = WalletView.LIST;
    },
    setInitialized(initialized: boolean) {
      self.initialized = initialized;
    },
    setNetwork(network: NetworkType) {
      self.network = network;
      self.navState.network = network;
      /* @ts-ignore */
      self.resetNavigation();
    },
    navigate(view: WalletView, options?: WalletNavOptions) {
      let canReturn = options?.canReturn || true;
      let walletIndex = options?.walletIndex || self.navState.walletIndex;
      let detail = options?.detail;
      let action = options?.action;
      let network = options?.network || self.navState.network;

      if (
        canReturn &&
        ![WalletView.LOCKED, WalletView.NEW].includes(self.navState.view)
      ) {
        let returnSnapshot = getSnapshot(self.navState);
        self.navHistory.push(WalletNavState.create(returnSnapshot));
      }

      let newState = WalletNavState.create({
        view,
        walletIndex,
        detail,
        action,
        network,
      });
      self.navState = newState;
    },
    navigateBack() {
      let DEFAULT_RETURN_VIEW = WalletView.LIST
      let returnSnapshot = getSnapshot(
        WalletNavState.create({
          view: DEFAULT_RETURN_VIEW,
          network: self.navState.network,
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
      });
      self.navHistory = cast([]);
    },
    setView(
      view: WalletView,
      index?: string,
      item?: { type: 'transaction' | 'coin' | 'nft'; key: string },
      unsetCurrentItem?: boolean
    ) {
      if (
        view === WalletView.LOCKED &&
        self.currentView === WalletView.LOCKED
      ) {
        // don't allow setting locked multiple times
        return;
      }

      if (index) {
        self.currentIndex = index;
      }

      if (item) {
        self.currentItem = item;
      } else if (unsetCurrentItem) {
        self.currentItem = undefined;
      }

      let returnView = self.currentView;
      if (returnView === WalletView.LOCKED) {
        // the return view should never be locked
        returnView = WalletView.LIST;
      }

      self.returnView = returnView;
      self.currentView = view;
    },
    setReturnView(view: WalletView) {
      self.returnView = view;
    },
    setNetworkProvider(network: 'bitcoin' | 'ethereum', provider: string) {
      if (network == 'bitcoin') self.bitcoin.setProvider(provider);
      else if (network == 'ethereum') self.ethereum.setProvider(provider);
    },
    setPasscodeHash(hash: string) {
      self.passcodeHash = hash;
    },
    setLastInteraction(date: Date) {
      self.lastInteraction = date;
    },
  }));

export type WalletStoreType = Instance<typeof WalletStore>;
