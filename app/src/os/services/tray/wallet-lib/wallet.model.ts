import { execFile } from 'child_process';
import {
  applySnapshot,
  types,
  Instance,
  getSnapshot,
  flow,
  cast,
} from 'mobx-state-tree';
import { setFlagsFromString } from 'v8';
import { WalletApi } from '../../../api/wallet';

export enum WalletView {
  LIST = 'list',
  NEW = 'new',
  WALLET_DETAIL = 'detail',
  TRANSACTION_SEND = 'send',
  TRANSACTION_CONFIRM = 'confirm',
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
  ethType: types.string,
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

const TransactionList = types
  .model('TransactionList', {
    transactions: types.map(Transaction),
  })
  .actions((self) => ({
    applyAgentTransaction(index: number, contract: string, transaction: any) {
      const tx = self.transactions.get(transaction.hash);
      if (tx) {
        tx.walletIndex = index;
        tx.notes = transaction.notes;
        self.transactions.set(transaction.hash, tx);
      } else {
        const tx = {
          ...transaction,
          walletIndex: index,
          amount: '0',
          notes: transaction.notes,
          ethType: contract || 'ETH',
        };
        self.transactions.set(transaction.hash, tx);
      }
    },
    applyChainTransactions(
      conduit: any,
      protocol: ProtocolType,
      index: number,
      address: string,
      transactions: any
    ) {
      for (const transaction of transactions) {
        const previousTransaction = self.transactions.get(transaction.hash);
        const newTransaction = {
          hash: transaction.hash,
          walletIndex: index,
          amount: transaction.value?.toString() || '0',
          network: 'ethereum',
          ethType: transaction.contractAddress || 'ETH',
          type: address === transaction.from ? 'sent' : 'received',
          initiatedAt: previousTransaction?.initiatedAt || '',
          completedAt: transaction.metadata.blockTimestamp,
          ourAddress: transaction.from,
          theirPatp: previousTransaction?.theirPatp,
          theirAddress: transaction.to,
          status: 'succeeded',
          failureReason: previousTransaction?.failureReason,
          notes: previousTransaction?.notes || '',
        };
        const previousStatus = previousTransaction?.status;
        self.transactions.set(transaction.hash, newTransaction);
        if (previousTransaction) {
          if (newTransaction.status !== previousStatus) {
            const tx = this.getStoredTransaction(transaction.hash);
            WalletApi.setTransaction(
              conduit,
              'ethereum',
              protocol,
              index,
              transaction.contractAddress || null,
              transaction.hash,
              tx
            );
          }
        }
      }
    },
    getStoredTransaction(hash: string) {
      const tx: any = self.transactions.get(hash);
      return {
        hash: tx.hash,
        network: tx.network,
        type: tx.type,
        'initiated-at': tx.initiatedAt || '',
        'completed-at': tx.completedAt || '',
        'our-address': tx.ourAddress,
        'their-patp': tx.theirPatp || null,
        'their-address': tx.theirAddress,
        status: tx.status,
        'failure-reason': tx.failureReason || '',
        notes: tx.notes || '',
      };
    },
  }));

export type TransactionListType = Instance<typeof TransactionList>;
const BitcoinWallet = types
  .model('BitcoinWallet', {
    index: types.number,
    network: types.string,
    path: types.string,
    address: types.string,
    nickname: types.string,
    balance: types.string,
    transactionList: TransactionList,
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
          transactionList: {},
        };
        const bitcoinWallet = BitcoinWallet.create(walletObj);
        self.wallets.set(wallet.key, bitcoinWallet);
      }
      /*for (const transaction in wallet.transactions) {
        self.wallets.get(wallet.key)!.applyTransactionUpdate(transaction);
      }*/
    },
    setExchangeRate(usd: number) {
      self.conversions.setUsd(usd);
    },
    setBlock(block: number) {
      self.block = block;
    },
  }));

export type BitcoinStoreType = Instance<typeof BitcoinStore>;

const conversions = types
  .model({
    usd: types.maybe(types.number),
    cad: types.maybe(types.number),
    euro: types.maybe(types.number),
  })
  .actions((self) => ({
    setUsd(usd: number) {
      self.usd = usd;
    },
  }));

const ERC20 = types
  .model('ERC20', {
    name: types.string,
    logo: types.string,
    address: types.string,
    balance: types.string,
    decimals: types.number,
    conversions,
    transactionList: TransactionList,
    block: types.number,
    uqbarMetadataId: types.maybe(types.string),
  })
  .actions((self) => ({
    setBalance(balance: string) {
      self.balance = balance;
    },
    setExchangeRate(usd: number) {
      self.conversions?.setUsd(usd);
    },
    setBlock(block: number) {
      self.block = block;
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
  transactionList: TransactionList,
  block: types.number,
});

export type ERC721Type = Instance<typeof ERC721>;

const EthWalletData = types
  .model('EthWalletData', {
    balance: types.string,
    coins: types.map(ERC20),
    nfts: types.map(ERC721),
    transactionList: TransactionList, //types.map(Transaction),
    block: types.number,
    uqbarTokenId: types.maybe(types.string),
  })
  .actions((self) => ({
    /*setCoins(coins: any) {
      applySnapshot(self.coins, coins);
    },*/
    setBlock(block: number) {
      self.block = block;
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
    /*setCoins(protocol: ProtocolType, coins: any) {
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
    },*/
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
    setCoin(protocol: ProtocolType, coin: Asset) {
      const coinData = coin.data as CoinAsset;
      if (!self.data.get(protocol)!.coins.has(coin.addr)) {
        self.data.get(protocol)!.coins.set(coin.addr, {
          name: coinData.symbol,
          logo: coinData.logo || '',
          address: coin.addr,
          balance: coinData.balance.toString(),
          decimals: coinData.decimals,
          conversions: conversions.create(),
          transactionList: {},
          block: 0,
        });
      } else {
        let coinToUpdate = self.data.get(protocol)!.coins.get(coin.addr)!;
        coinToUpdate.name = coinData.symbol;
        coinToUpdate.logo = coinData.logo || '';
        coinToUpdate.address = coin.addr;
        coinToUpdate.balance = coinData.balance.toString();
        coinToUpdate.decimals = coinData.decimals;
      }
    },
    updateNft(protocol: ProtocolType, nft: Asset) {
      const nftData = nft.data as NFTAsset;
      self.data.get(protocol)!.nfts.set(nft.addr + nftData.tokenId, {
        name: nftData.name,
        collectionName: '',
        address: nft.addr,
        tokenId: nftData.tokenId,
        imageUrl: nftData.image,
        lastPrice: '',
        block: 0,
        transactionList: {},
      });
    },
    updateNftTransfers(protocol: ProtocolType, transfers: any) {},
    setBalance(protocol: ProtocolType, balance: string) {
      self.data.get(protocol)!.balance = balance;
    },
    setUqbarTokenId(protocol: ProtocolType, tokenId: string) {
      self.data.get(protocol)!.uqbarTokenId = tokenId;
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
      const tx: any = self.data
        .get(protocol)!
        .transactionList.transactions.get(hash);
      return {
        hash: tx.hash,
        walletIndex: self.index,
        amount: tx.amount,
        network: tx.network,
        type: tx.type,
        'initiated-at': tx.initiatedAt,
        'completed-at': tx.completedAt || '',
        'our-address': tx.ourAddress,
        'their-patp': tx.theirPatp || null,
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
      if (contractType) {
        self.data
          .get(protocol)!
          .coins.get(contractType)!
          .transactionList.transactions.set(hash, tx);
      } else {
        self.data.get(protocol)!.transactionList.transactions.set(hash, tx);
      }
    },
    applyTransactionUpdate(
      protocol: ProtocolType,
      contract: any,
      transaction: any
    ) {
      if (contract) {
        if (!self.data.get(protocol)!.coins.has(contract)) {
          self.data.get(protocol)!.coins.set(contract, {
            name: '',
            logo: '',
            address: contract,
            balance: '0',
            decimals: 18,
            conversions: conversions.create(),
            transactionList: {},
            block: 0,
          });
        }
        let txList = self.data
          .get(protocol)!
          .coins.get(contract)!.transactionList;
        txList.applyAgentTransaction(self.index, contract, transaction);
      } else {
        let netMap = self.data.get(protocol)!.transactionList;
        netMap.applyAgentTransaction(self.index, contract, transaction);
      }
    },
  }));

export type EthWalletType = Instance<typeof EthWallet>;

export const EthStore = types
  .model('EthStore', {
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
              transactionList: {},
              block: 0,
            },
            [ProtocolType.ETH_GORLI]: {
              balance: '0',
              coins: {},
              nfts: {},
              transactionList: {},
              block: 0,
            },
            [ProtocolType.UQBAR]: {
              balance: '0',
              coins: {},
              nfts: {},
              transactionList: {},
              block: 0,
            },
          },
        };
        const ethWallet = EthWallet.create(walletObj);
        self.wallets.set(wallet.key, ethWallet);
      }
      if (wallet.transactions) {
        for (const protocol of Object.keys(wallet.transactions)) {
          const protocolTransactions = wallet.transactions[protocol];
          for (const transactionKey of Object.keys(protocolTransactions)) {
            const transaction = protocolTransactions[transactionKey];
            self.wallets
              .get(wallet.key)!
              .applyTransactionUpdate(
                protocol as ProtocolType,
                null,
                transaction
              );
          }
        }
      }
      if (wallet['token-txns']) {
        for (const protocol of Object.keys(wallet['token-txns'])) {
          const protocolTransactions = wallet['token-txns'][protocol];
          for (const contract of Object.keys(protocolTransactions)) {
            const contractTransactions = protocolTransactions[contract];
            for (const transactionKey of Object.keys(contractTransactions)) {
              const transaction = contractTransactions[transactionKey];
              self.wallets
                .get(wallet.key)!
                .applyTransactionUpdate(
                  protocol as ProtocolType,
                  contract,
                  transaction
                );
            }
          }
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
        txtype: types.maybe(types.enumeration(['general', 'coin', 'nft'])),
        coinKey: types.maybe(types.string),
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

export const UqTx = types.model('UqTx', {
  status: types.string,
  contract: types.string,
  budget: types.string,
  from: types.string,
  rate: types.string,
  action: types.model({
    noun: types.model({
      custom: types.string
    })
  }),
  nonce: types.string,
  town: types.string,
  hash: types.string
});
export type UqTxType = Instance<typeof UqTx>;


export interface WalletNavOptions {
  canReturn?: boolean;
  network?: NetworkType;
  networkStore?: NetworkStoreType;
  protocol?: ProtocolType;
  lastEthProtocol?: ProtocolType;
  walletIndex?: string;
  detail?: {
    type: 'transaction' | 'coin' | 'nft';
    txtype?: 'general' | 'coin' | 'nft';
    coinKey?: string;
    key: string;
  };
  action?: {
    type: string;
    data: any;
  };
  uqTx?: UqTxType;
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
    forceActive: types.boolean,
    uqTx: types.maybe(UqTx),
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
  .actions((self) => {
    let initialState = {};
    return {
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
      console.log('the uqtx', options?.uqTx);
      self.uqTx = options?.uqTx ? UqTx.create(options.uqTx) : undefined;

      if (
        canReturn &&
        ![WalletView.LOCKED, WalletView.NEW, WalletView.TRANSACTION_SEND, WalletView.TRANSACTION_CONFIRM].includes(self.navState.view)
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
    setForceActive(forceActive: boolean) {
      self.forceActive = forceActive;
    },
    reset: (initialState: any) => {
      applySnapshot(self, initialState);
    }
  }});

export type WalletStoreType = Instance<typeof WalletStore>;
