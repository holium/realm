import bcrypt from 'bcryptjs';
import {
  applySnapshot,
  cast,
  flow,
  getSnapshot,
  Instance,
  types,
} from 'mobx-state-tree';

import { WalletIPC } from '../ipc';
import { shipStore } from '../ship.store';

// 10 minutes
const AUTO_LOCK_INTERVAL = 1000 * 60 * 10;

export interface RecipientPayload {
  recipientMetadata?: {
    color: string;
    avatar?: string;
    nickname?: string;
  };
  patp: string;
  address?: string | null;
  gasEstimate?: number;
}

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

export enum ChainType {
  ETHEREUM = 'ethereum',
  BITCOIN = 'bitcoin',
}

export enum NetworkType {
  ETH_MAIN = 'Ethereum Mainnet',
  ETH_GORLI = 'Görli Testnet',
  BTC_MAIN = 'Bitcoin Mainnet',
  BTC_TEST = 'Bitcoin Testnet',
  UQBAR = 'Uqbar Network',
}
const Protocols = types.enumeration(Object.values(NetworkType));

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
      protocol: NetworkType,
      index: number,
      address: string,
      transactions: any
    ) {
      for (const transaction of transactions) {
        const previousTransaction = self.transactions.get(transaction.hash);
        const sent = address === transaction.from;
        const newTransaction = {
          hash: transaction.hash,
          walletIndex: index,
          amount: transaction.value?.toString() || '0',
          network: 'ethereum',
          ethType: transaction.contractAddress || 'ETH',
          type: sent ? 'sent' : 'received',
          initiatedAt: previousTransaction?.initiatedAt || '',
          completedAt: transaction.metadata.blockTimestamp,
          ourAddress: sent ? transaction.from : transaction.to,
          theirPatp: previousTransaction?.theirPatp,
          theirAddress: sent ? transaction.to : transaction.from,
          status: 'succeeded',
          failureReason: previousTransaction?.failureReason,
          notes: previousTransaction?.notes || '',
        };
        const previousStatus = previousTransaction?.status;
        self.transactions.set(transaction.hash, newTransaction);
        if (previousTransaction) {
          if (newTransaction.status !== previousStatus) {
            const tx = this.getStoredTransaction(transaction.hash);
            this.setTransaction(
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
    setTransaction: flow(function* (
      network: NetworkType,
      index: number,
      contractAddress: string | null,
      hash: string,
      tx: any
    ): Generator<PromiseLike<any>, void, any> {
      yield WalletIPC.insertTransaction(
        'ethereum',
        network,
        index,
        contractAddress,
        hash,
        tx
      ) as PromiseLike<any>;
    }),
    getStoredTransaction(hash: string) {
      const tx: any = self.transactions.get(hash);
      return {
        hash: tx.hash,
        network: tx.chain,
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
    applyTransactions(_transactions: any) {},
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
          index: Number(wallet['wallet_index']),
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
        self.wallets.get(wallet.key).applyTransactionUpdate(transaction);
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
      applySnapshot(self.data.get(protocol).coins, getSnapshot(newCoins));
    },*/
    setNFTs(protocol: NetworkType, nfts: any) {
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
      const erc721Nfts = self.data.get(protocol)?.nfts;
      if (erc721Nfts) applySnapshot(erc721Nfts, getSnapshot(newNft));
    },
    setCoin(protocol: NetworkType, coin: Asset) {
      const coinData = coin.data as CoinAsset;
      if (!self.data.get(protocol)?.coins.has(coin.addr)) {
        self.data.get(protocol)?.coins.set(coin.addr, {
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
        const coinToUpdate = self.data.get(protocol)?.coins.get(coin.addr);
        if (!coinToUpdate) return;
        coinToUpdate.name = coinData.symbol;
        coinToUpdate.logo = coinData.logo || '';
        coinToUpdate.address = coin.addr;
        coinToUpdate.balance = coinData.balance.toString();
        coinToUpdate.decimals = coinData.decimals;
      }
    },
    updateNft(protocol: NetworkType, nft: Asset) {
      const nftData = nft.data as NFTAsset;
      self.data.get(protocol)?.nfts.set(nft.addr + nftData.tokenId, {
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
    updateNftTransfers(_protocol: NetworkType, _transfers: any) {},
    setBalance(protocol: NetworkType, balance: string) {
      const walletData = self.data.get(protocol);
      if (walletData) walletData.balance = balance;
    },
    setUqbarTokenId(protocol: NetworkType, tokenId: string) {
      const walletData = self.data.get(protocol);
      if (walletData) walletData.uqbarTokenId = tokenId;
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
    getTransaction(protocol: NetworkType, hash: string) {
      const tx: any = self.data
        .get(protocol)
        ?.transactionList.transactions.get(hash);
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
      protocol: NetworkType,
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
        amount: contractType ? amount : gweiToEther(amount).toString(),
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
          .get(protocol)
          ?.coins.get(contractType)
          ?.transactionList.transactions.set(hash, tx);
      } else {
        self.data.get(protocol)?.transactionList.transactions.set(hash, tx);
      }
    },
    applyTransactionUpdate(
      protocol: NetworkType,
      contract: any,
      transaction: any
    ) {
      if (contract) {
        if (!self.data.get(protocol)?.coins.has(contract)) {
          self.data.get(protocol)?.coins.set(contract, {
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
        const txList = self.data
          .get(protocol)
          ?.coins.get(contract)?.transactionList;
        txList?.applyAgentTransaction(self.index, contract, transaction);
      } else {
        const netMap = self.data.get(protocol)?.transactionList;
        netMap?.applyAgentTransaction(self.index, contract, transaction);
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
      return Array.from(self.wallets)
        .map(([key, wallet]) => ({
          key,
          nickname: wallet.nickname,
          address: wallet.address,
          balance: wallet.data.get(self.protocol)?.balance,
        }))
        .sort((a: any, b: any) => {
          return a.key > b.key ? 1 : -1;
        });
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
    applyWalletUpdate(wallet: any) {
      console.log('wallet update', wallet);
      let walletObj;
      if (!self.wallets.has(wallet['wallet_index'])) {
        walletObj = {
          index: Number(wallet['wallet_index']),
          network: 'ethereum',
          path: wallet.path,
          address: '0x' + wallet.address.substring(2).padStart(40, '0'),
          nickname: wallet.nickname,
          data: {
            [NetworkType.ETH_MAIN]: {
              balance: '0',
              coins: {},
              nfts: {},
              transactionList: {},
              block: 0,
            },
            [NetworkType.ETH_GORLI]: {
              balance: '0',
              coins: {},
              nfts: {},
              transactionList: {},
              block: 0,
            },
            [NetworkType.UQBAR]: {
              balance: '0',
              coins: {},
              nfts: {},
              transactionList: {},
              block: 0,
            },
          },
        };
        const ethWallet = EthWallet.create(walletObj);
        console.log('ethWallet', ethWallet);
        console.log('index', wallet['wallet_index']);
        self.wallets.set(wallet['wallet_index'], ethWallet);
      }
      if (wallet.transactions) {
        for (const protocol of Object.keys(wallet.transactions)) {
          const protocolTransactions = wallet.transactions[protocol];
          for (const transactionKey of Object.keys(protocolTransactions)) {
            const transaction = protocolTransactions[transactionKey];
            self.wallets
              .get(wallet.key)
              ?.applyTransactionUpdate(
                protocol as NetworkType,
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
                .get(wallet.key)
                ?.applyTransactionUpdate(
                  protocol as NetworkType,
                  contract,
                  transaction
                );
            }
          }
        }
      }
    },
    setProtocol(protocol: NetworkType) {
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
    to: types.maybe(types.string),
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
    get network(): ChainType {
      switch (self.protocol) {
        case NetworkType.ETH_MAIN:
          return ChainType.ETHEREUM;
        case NetworkType.ETH_GORLI:
          return ChainType.ETHEREUM;
        case NetworkType.UQBAR:
          return ChainType.ETHEREUM;
        case NetworkType.BTC_MAIN:
          return ChainType.BITCOIN;
        case NetworkType.BTC_TEST:
          return ChainType.BITCOIN;
        default:
          return ChainType.ETHEREUM;
      }
    },
    get networkStore(): NetworkStoreType {
      switch (self.protocol) {
        case NetworkType.ETH_MAIN:
          return NetworkStoreType.ETHEREUM;
        case NetworkType.ETH_GORLI:
          return NetworkStoreType.ETHEREUM;
        case NetworkType.UQBAR:
          return NetworkStoreType.ETHEREUM;
        case NetworkType.BTC_MAIN:
          return NetworkStoreType.BTC_MAIN;
        case NetworkType.BTC_TEST:
          return NetworkStoreType.BTC_TEST;
        default:
          return NetworkStoreType.ETHEREUM;
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
      custom: types.string,
    }),
  }),
  nonce: types.string,
  town: types.string,
  hash: types.string,
});
export type UqTxType = Instance<typeof UqTx>;

export interface WalletNavOptions {
  canReturn?: boolean;
  network?: ChainType;
  networkStore?: NetworkStoreType;
  protocol?: NetworkType;
  lastEthProtocol?: NetworkType;
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
  to?: string;
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
        case NetworkStoreType.BTC_TEST:
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
    return {
      init: flow(function* (): Generator<PromiseLike<any>, void, any> {
        try {
          const wallets = yield WalletIPC.getWallets() as PromiseLike<any>;
          console.log('got wallets', wallets);
          for (const wallet of wallets) {
            if (wallet.chain === 'ethereum') {
              shipStore.walletStore.ethereum.applyWalletUpdate(wallet);
            } else if (wallet.chain === 'bitcoin') {
              shipStore.walletStore.bitcoin.applyWalletUpdate(wallet);
            } else if (wallet.chain === 'btctestnet') {
              shipStore.walletStore.btctest.applyWalletUpdate(wallet);
            }
          }
          console.log('wallets', shipStore.walletStore.ethereum.wallets);
          // @ts-expect-error
          self.updateWalletState();
          /*const transactions =
            yield WalletIPC.getTransactions() as PromiseLike<any>;*/
          const hasMnemonic = yield WalletIPC.hasMnemonic(window.ship);
          if (hasMnemonic) {
            // @ts-expect-error
            self.resetNavigation();
            // @ts-expect-error
            self.lock();
          }
          // @ts-expect-error
          setInterval(() => self.autoLock(), AUTO_LOCK_INTERVAL);
        } catch (error) {
          console.error(error);
        }
      }),
      setInitialized(initialized: boolean) {
        self.initialized = initialized;
      },
      setNetworkSetter(network: ChainType) {
        this.resetNavigation();
        if (network !== self.navState.network) {
          switch (network) {
            case ChainType.ETHEREUM:
              self.navState.protocol = self.ethereum.protocol;
              break;
            case ChainType.BITCOIN:
              self.navState.protocol =
                self.navState.btcNetwork === NetworkStoreType.BTC_MAIN
                  ? NetworkType.BTC_MAIN
                  : NetworkType.BTC_TEST;
              break;
          }
        }
      },
      setNetwork(network: ChainType) {
        this.navigate(WalletView.LIST);
        if (self.navState.network !== network) {
          this.setNetworkSetter(network);
          this.watchUpdates(self.navState.protocol);
        }
      },
      setProtocolSetter(protocol: NetworkType) {
        this.resetNavigation();
        if (protocol === NetworkType.UQBAR) {
          self.navState.lastEthProtocol =
            self.navState.protocol === NetworkType.UQBAR
              ? NetworkType.ETH_MAIN
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
        const to = options?.to;
        self.uqTx = options?.uqTx ? UqTx.create(options.uqTx) : undefined;

        if (
          canReturn &&
          ![
            WalletView.LOCKED,
            WalletView.NEW,
            WalletView.TRANSACTION_SEND,
            WalletView.TRANSACTION_CONFIRM,
          ].includes(self.navState.view)
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
          to,
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
          const popped = self.navHistory.pop();
          if (popped) returnSnapshot = getSnapshot(popped);
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
      setSettingsSetter(settings: any) {
        self.settings.passcodeHash = settings.passcodeHash;
        self.blacklist = settings.blocked;
        for (const network of Object.keys(settings.networks)) {
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
      setSettings: flow(function* (
        network: string,
        settings: UISettingsType
      ): Generator<PromiseLike<any>, void, any> {
        yield WalletIPC.setSettings(network, settings) as PromiseLike<any>;
      }),
      setForceActive(forceActive: boolean) {
        self.forceActive = forceActive;
      },
      reset() {
        // applySnapshot(self, walletAppDefault);
      },
      deleteShipWallet(passcode: number[]) {
        this.deleteShipMnemonic(passcode);
        this.reset();
      },
      deleteLocalWallet(passcode: number[]) {
        this.deleteLocalMnemonic(passcode);
        this.reset();
      },
      deleteLocalMnemonic: flow(function* (
        passcode: number[]
      ): Generator<PromiseLike<any>, void, any> {
        const passcodeString = passcode.map(String).join('');
        yield WalletIPC.deleteLocalMnemonic(
          window.ship,
          passcodeString ?? ''
        ) as PromiseLike<any>;
      }),
      deleteShipMnemonic: flow(function* (
        passcode: number[]
      ): Generator<PromiseLike<any>, void, any> {
        const passcodeString = passcode.map(String).join('');
        yield WalletIPC.deleteShipMnemonic(
          window.ship,
          passcodeString ?? ''
        ) as PromiseLike<any>;
      }),
      setMnemonic: flow(function* (
        mnemonic: string,
        passcode: number[]
      ): Generator<PromiseLike<any>, void, any> {
        const passcodeString = passcode.map(String).join('');
        yield WalletIPC.setMnemonic(
          mnemonic,
          window.ship,
          passcodeString
        ) as PromiseLike<any>;
        const passcodeHash = yield bcrypt.hash(passcodeString, 12);
        yield WalletIPC.setPasscodeHash(passcodeHash) as PromiseLike<any>;
        yield WalletIPC.setXpub(
          'ethereum',
          "m/44'/60'/0'",
          window.ship,
          passcodeString
        ) as PromiseLike<any>;
        yield WalletIPC.setXpub(
          'bitcoin',
          "m/44'/0'/0'",
          window.ship,
          passcodeString
        ) as PromiseLike<any>;
        yield WalletIPC.setXpub(
          'btctestnet',
          "m/44'/1'/0'",
          window.ship,
          passcodeString
        ) as PromiseLike<any>;
      }),
      createWalletFlow: flow(function* (
        nickname: string
      ): Generator<PromiseLike<any>, void, any> {
        const sender = window.ship;
        let network: string = self.navState.network;
        if (
          network === 'bitcoin' &&
          self.navState.btcNetwork === NetworkStoreType.BTC_TEST
        ) {
          network = 'btctestnet';
        }
        yield WalletIPC.createWallet(
          sender,
          network,
          nickname
        ) as PromiseLike<any>;
      }),
      createWallet(nickname: string) {
        this.createWalletFlow(nickname);
        this.navigate(WalletView.LIST, { canReturn: false });
      },
      sendEthereumTransaction: flow(function* (
        walletIndex: string,
        to: string,
        amount: string,
        passcode: number[],
        toPatp?: string
      ): Generator<PromiseLike<any>, void, any> {
        const path = "m/44'/60'/0'/0/0" + walletIndex;
        const from = self.ethereum.wallets.get(walletIndex)?.address ?? '';
        const { hash, tx } = yield WalletIPC.sendTransaction(
          self.navState.protocol,
          path,
          window.ship,
          passcode.map(String).join(''),
          from,
          to,
          amount
        ) as PromiseLike<any>;
        const currentWallet = self.currentWallet as EthWalletType;
        const fromAddress = currentWallet.address;
        currentWallet.enqueueTransaction(
          self.navState.protocol,
          hash,
          tx.to,
          toPatp,
          fromAddress,
          tx.value,
          new Date().toISOString()
        );
        const stateTx = currentWallet.data
          .get(self.navState.protocol)
          ?.transactionList.getStoredTransaction(hash);

        yield WalletIPC.insertTransaction(
          'ethereum',
          self.navState.protocol,
          currentWallet.index,
          null,
          hash,
          stateTx
        ) as PromiseLike<any>;
      }),
      sendERC20Transaction: flow(function* (
        walletIndex: string,
        to: string,
        amount: string,
        contractAddress: string,
        passcode: number[],
        toPatp?: string
      ): Generator<PromiseLike<any>, void, any> {
        const path = "m/44'/60'/0'/0/0" + walletIndex;
        const from = self.ethereum.wallets.get(walletIndex)?.address ?? '';
        const { hash } = yield WalletIPC.sendERC20Transaction(
          self.navState.protocol,
          path,
          window.ship,
          passcode.map(String).join(''),
          from,
          to,
          amount,
          contractAddress,
          self.ethereum.wallets
            .get(walletIndex)
            ?.data.get(self.navState.protocol)
            ?.coins.get(contractAddress)?.decimals ?? 0
        ) as PromiseLike<any>;
        const currentWallet = self.currentWallet as EthWalletType;
        const fromAddress = currentWallet.address;
        currentWallet.enqueueTransaction(
          self.navState.protocol,
          hash,
          to,
          toPatp,
          fromAddress,
          amount,
          new Date().toISOString(),
          contractAddress
        );
        const stateTx = currentWallet.data
          .get(self.navState.protocol)
          ?.coins.get(contractAddress)
          ?.transactionList.getStoredTransaction(hash);
        yield WalletIPC.insertTransaction(
          'ethereum',
          self.navState.protocol,
          currentWallet.index,
          contractAddress,
          hash,
          stateTx
        ) as PromiseLike<any>;
      }),
      toggleNetwork() {
        if (self.navState.network === ChainType.ETHEREUM) {
          if (self.navState.protocol === NetworkType.ETH_MAIN) {
            this.setProtocolSetter(NetworkType.ETH_GORLI);
            this.watchUpdates(NetworkType.ETH_GORLI);
          } else if (self.navState.protocol === NetworkType.ETH_GORLI) {
            this.setProtocolSetter(NetworkType.ETH_MAIN);
            this.watchUpdates(NetworkType.ETH_MAIN);
          }
        }
      },
      watchUpdates: flow(function* (
        protocol?: NetworkType
      ): Generator<PromiseLike<any>, void, any> {
        const watchProtocol = protocol ?? self.navState.protocol;
        yield WalletIPC.watchUpdates(watchProtocol) as PromiseLike<any>;
      }),
      updateWalletState: flow(function* (
        protocol?: NetworkType
      ): Generator<PromiseLike<any>, void, any> {
        const watchProtocol = protocol ?? self.navState.protocol;
        yield WalletIPC.updateWalletState(watchProtocol) as PromiseLike<any>;
      }),
      setProtocol(protocol: NetworkType) {
        this.navigate(WalletView.LIST);
        if (self.navState.protocol !== protocol) {
          this.setProtocolSetter(protocol);
        }
      },
      checkPasscode: flow(function* (
        passcode: number[]
      ): Generator<PromiseLike<any>, boolean, any> {
        return yield WalletIPC.checkPasscodeHash(passcode) as PromiseLike<any>;
      }),
      hasPasscode: flow(function* (): Generator<
        PromiseLike<any>,
        boolean,
        any
      > {
        return yield WalletIPC.hasPasscodeHash() as PromiseLike<any>;
      }),
      getRecipient: flow(function* (
        ship: string
      ): Generator<PromiseLike<any>, any, any> {
        const patp = ship.includes('~') ? ship : `~${ship}`;
        const recipientMetadata: {
          color: string;
          avatar?: string;
          nickname?: string;
        } = shipStore.friends.getContactAvatarMetadata(patp);
        const address = yield WalletIPC.getAddress(
          self.navState.network,
          patp
        ) as PromiseLike<any>;
        return {
          patp,
          gasEstimate: 7,
          recipientMetadata,
          address,
        };
      }),
      saveTransactionNotes: flow(function* (
        transaction: any,
        notes: string
      ): Generator<PromiseLike<any>, void, any> {
        const network = self.navState.network;
        const net = self.navState.protocol;
        const contract =
          self.navState.detail?.txtype === 'coin'
            ? self.navState.detail.coinKey ?? null
            : null;
        const hash = self.navState.detail?.key ?? '';
        const index = self.currentWallet?.index ?? 0;
        yield WalletIPC.saveTransactionNotes(
          network,
          net,
          index,
          contract,
          hash,
          notes
        ) as PromiseLike<any>;
        yield WalletIPC.insertTransaction(net);
      }),
      checkMnemonic: flow(function* (
        mnemonic: string
      ): Generator<PromiseLike<any>, boolean, any> {
        return yield WalletIPC.checkMnemonic(mnemonic) as PromiseLike<any>;
      }),
      autoLock() {
        const shouldLock =
          Date.now() - AUTO_LOCK_INTERVAL > self.lastInteraction.getTime();
        if (shouldLock) {
          this.lock();
        }
      },
      lock: flow(function* (): Generator<PromiseLike<any>, void, any> {
        // @ts-expect-error
        const hasPasscode = yield self.hasPasscode() as PromiseLike<any>;
        // @ts-expect-error
        self.pauseUpdates();
        if (hasPasscode) {
          // @ts-expect-error
          self.navigate(WalletView.LOCKED);
        }
      }),
      pauseUpdates: flow(function* (): Generator<PromiseLike<any>, void, any> {
        yield WalletIPC.pauseUpdates() as PromiseLike<any>;
      }),
      getWalletsUpdate: flow(function* (): Generator<
        PromiseLike<any>,
        void,
        any
      > {
        yield WalletIPC.getWalletsUpdate() as PromiseLike<any>;
      }),
    };
  });

export type WalletStoreType = Instance<typeof WalletStore>;

WalletIPC.onUpdate((payload: any) => {
  const type = payload.type ?? Object.keys(payload)[0];
  switch (type) {
    case 'wallets':
      const wallets = payload.payload;
      for (const wallet of wallets) {
        if (wallet.chain === 'ethereum') {
          shipStore.walletStore.ethereum.applyWalletUpdate(wallet);
        } else if (wallet.chain === 'bitcoin') {
          shipStore.walletStore.bitcoin.applyWalletUpdate(wallet);
        } else if (wallet.chain === 'btctestnet') {
          shipStore.walletStore.btctest.applyWalletUpdate(wallet);
        }
        shipStore.walletStore.updateWalletState();
      }
      break;
    case 'wallet':
      const wallet = payload.payload;
      if (wallet.chain === 'ethereum') {
        shipStore.walletStore.ethereum.applyWalletUpdate(wallet);
      } else if (wallet.chain === 'bitcoin') {
        shipStore.walletStore.bitcoin.applyWalletUpdate(wallet);
      } else if (wallet.chain === 'btctestnet') {
        shipStore.walletStore.btctest.applyWalletUpdate(wallet);
      }
      shipStore.walletStore.updateWalletState();
      break;
    case 'transaction':
      const transaction = payload.transaction;
      const network: NetworkStoreType =
        transaction.network === NetworkType.ETH_MAIN ||
        transaction.network === NetworkType.ETH_GORLI ||
        transaction.network === NetworkType.UQBAR
          ? NetworkStoreType.ETHEREUM
          : transaction.network === NetworkType.BTC_MAIN
          ? NetworkStoreType.BTC_MAIN
          : NetworkStoreType.BTC_TEST;
      if (network === NetworkStoreType.ETHEREUM) {
        shipStore.walletStore.ethereum.wallets
          .get(transaction.index)
          ?.applyTransactionUpdate(
            transaction.network,
            transaction.contract,
            transaction.transaction
          );
      } else if (network === NetworkStoreType.BTC_MAIN) {
        /*walletState.bitcoin.wallets
          .get(transaction.index)!
          .applyTransactionUpdate(transaction.net, transaction.transaction);*/
      } else if (network === NetworkStoreType.BTC_TEST) {
        /*walletState.btctest.wallets.get(
          transaction.index
        ).applyTransactions(transaction.net, transaction.transaction);*/
      }
      break;
    case 'settings':
      shipStore.walletStore.setSettingsSetter(payload.settings);
      break;
    case 'set-balance':
      const balanceData = payload['set-balance'];
      shipStore.walletStore.ethereum.wallets
        .get(balanceData.index)
        ?.setBalance(balanceData.protocol, balanceData.balance);
      break;
    case 'apply-chain-transactions':
      const chainTransactions = payload['apply-chain-transactions'];
      shipStore.walletStore.ethereum.wallets
        .get(chainTransactions.index)
        ?.data.get(chainTransactions.protocol)
        ?.transactionList.applyChainTransactions(
          chainTransactions.protocol,
          chainTransactions.index,
          chainTransactions.address,
          chainTransactions.transactions
        );
      break;
    case 'set-block':
      const blockData = payload['set-block'];
      shipStore.walletStore.ethereum.wallets
        .get(blockData.index)
        ?.data.get(blockData.protocol)
        ?.setBlock(blockData.block);
      break;
    case 'set-coin':
      const coinData = payload['set-coin'];
      shipStore.walletStore.ethereum.wallets
        .get(coinData.index)
        ?.setCoin(coinData.protocol, coinData.coin);
      break;
    case 'update-nft':
      const nftData = payload['update-nft'];
      shipStore.walletStore.ethereum.wallets
        .get(nftData.index)
        ?.updateNft(nftData.protocol, nftData.nft);
      break;
    case 'update-nft-transfers':
      const nftUpdateData = payload['update-nft-transfers'];
      shipStore.walletStore.ethereum.wallets
        .get(nftUpdateData.index)
        ?.updateNftTransfers(nftUpdateData.protocol, nftUpdateData.transfers);
      break;
    case 'set-coin-block':
      const coinBlockData = payload['set-coin-block'];
      shipStore.walletStore.ethereum.wallets
        .get(coinBlockData.index)
        ?.data.get(coinBlockData.protocol)
        ?.coins.get(coinBlockData.coinAddr)
        ?.setBlock(coinBlockData.block);
      break;
    case 'apply-coin-transactions':
      const coinTransactionData = payload['apply-coin-transactions'];
      if (
        shipStore.walletStore.ethereum.wallets
          .get(coinTransactionData.index)
          ?.data.get(coinTransactionData.protocol)
          ?.coins.has(coinTransactionData.coinAddr) &&
        coinTransactionData.transactions.length > 0
      ) {
        shipStore.walletStore.ethereum.wallets
          .get(coinTransactionData.index)
          ?.data.get(coinTransactionData.protocol)
          ?.coins.get(coinTransactionData.coinAddr)
          ?.transactionList.applyChainTransactions(
            coinTransactionData.protocol,
            coinTransactionData.index,
            coinTransactionData.coinAddr,
            coinTransactionData.transactions
          );
      }
      break;
    default:
      break;
  }
});
