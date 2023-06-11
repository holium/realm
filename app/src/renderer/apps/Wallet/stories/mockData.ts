import {
  NetworkType,
  ProtocolType,
  SharingMode,
  WalletCreationMode,
} from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinConversionsType,
  BitcoinStoreType,
  BitcoinWalletType,
  ERC20ConversionsType,
  ERC20Type,
  ERC721Type,
  EthConversionsType,
  EthStoreType,
  EthWalletType,
  TransactionType,
} from 'renderer/stores/models/wallet.model';

import { WalletWithKey } from '../screens/Base/WalletListScreen/WalletListScreenBody';

const bitcoinConversions: BitcoinConversionsType = {
  usd: Promise.resolve(10000),
};
const ethConversions: EthConversionsType = {
  usd: Promise.resolve(1000),
};
const coinConversions: ERC20ConversionsType = {
  getUsdPrice: () => Promise.resolve(100),
};

const bitcoinWallet: BitcoinWalletType = {
  index: 3,
  network: NetworkType.BITCOIN,
  path: "m/44'/0'/0'/0/0",
  address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  balance: '0.000000000000000000',
  nickname: 'Bitcoin Account',
  transactionList: {} as any,
  setBalance: () => {},
  applyTransactions: () => {},
};

const ethereumWallet1: EthWalletType = {
  index: 0,
  network: NetworkType.ETHEREUM,
  path: "m/44'/60'/0'/0/0",
  address: '0x123456789',
  nickname: 'Main Account',
  data: {
    get: () => ({
      balance: '0.003200000000000000',
      transactionList: {
        transactions: mockTransactions,
      },
      coins: mockCoins_account1,
    }),
  } as any,
  setBalance: () => {},
  setNFTs: () => {},
  setCoin: () => {},
  updateNft: () => {},
  updateNftTransfers: () => {},
  setUqbarTokenId: () => {},
  getTransaction: () => ({} as any),
  enqueueTransaction: () => {},
  applyTransactionUpdate: () => {},
};

const ethereumWallet2: EthWalletType = {
  ...ethereumWallet1,
  index: 1,
  path: "m/44'/60'/0'/0/1",
  address: '0x987654321',
  nickname: 'Test Account',
  data: {
    get: () => ({
      balance: '0.000000000000000000',
      transactionList: {
        transactions: [],
      },
      coins: mockCoins_account2,
    }),
  } as any,
};

const bitcoinWallets = new Map<string, BitcoinWalletType>();
bitcoinWallets.set('0', bitcoinWallet);

const ethereumWallets = new Map<string, EthWalletType>();
ethereumWallets.set('0', ethereumWallet1);
ethereumWallets.set('1', ethereumWallet2);

const settings = {
  walletCreationMode: WalletCreationMode.DEFAULT,
  sharingMode: SharingMode.NOBODY,
  defaultIndex: 0,
  provider: undefined,
  setWalletCreationMode: () => {},
  setSharingMode: () => {},
  setDefaultIndex: () => {},
  setProvider: () => {},
};

export const mockBitcoin: BitcoinStoreType = {
  block: 0,
  wallets: bitcoinWallets as any,
  settings,
  conversions: bitcoinConversions,
  list: {} as any,
  initial: () => {},
  setProvider: () => {},
  applyWalletUpdate: () => {},
  setBlock: () => {},
};

export const mockEthereum: EthStoreType = {
  gorliBlock: 0,
  protocol: ProtocolType.ETH_MAIN,
  wallets: ethereumWallets as any,
  settings,
  initialized: false,
  conversions: ethConversions,
  list: {} as any,
  initial: () => {},
  setProvider: () => {},
  applyWalletUpdate: () => {},
  setDefaultWallet: () => {},
  setProtocol: () => {},
  deleteWallets: () => {},
  setSettings: () => {},
};

export const mockShibaCoin: ERC20Type = {
  name: 'Shiba',
  logo: 'https://dynamic-assets.coinbase.com/c14c8dc36c003113c898b56dfff649eb0ff71249fd7c8a9de724edb2dedfedde5562ba4a194db8433f2ef31a1e879af0727e6632751539707b17e66d63a9013b/asset_icons/a7309384448163db7e3e9fded23cd6ecf3ea6e1fb3800cab216acb7fc85f9563.png',
  address: '0x123456789',
  balance: '0',
  decimals: 18,
  conversions: coinConversions,
  transactionList: {} as any,
  block: 0,
  uqbarMetadataId: undefined,
  setBalance: () => {},
  setBlock: () => {},
};

export const mockBitcoinCoin: ERC20Type = {
  ...mockShibaCoin,
  name: 'Bitcoin',
  logo: 'https://dynamic-assets.coinbase.com/e785e0181f1a23a30d9476038d9be91e9f6c63959b538eabbc51a1abc8898940383291eede695c3b8dfaa1829a9b57f5a2d0a16b0523580346c6b8fab67af14b/asset_icons/b57ac673f06a4b0338a596817eb0a50ce16e2059f327dc117744449a47915cb2.png',
  address: '0x135792468',
  decimals: 8,
};

const mockCoins_account1 = new Map();
mockCoins_account1.set('0x123456789', mockShibaCoin);
mockCoins_account1.set('0x987654321', {
  name: 'Chainlink',
  logo: 'https://dynamic-assets.coinbase.com/37ef8491789cea02a81cf80394ed3a4b5d9c408a969fd6bea76b403e04e7fd9cef623384d16a60f3c39e052006bc79522d902108764ce584466674a4da6cb316/asset_icons/c551d7b5ffe48f1d72e726ab8932ad98758ab414062e5e07479096089c547220.png',
});
mockCoins_account1.set('0x135792468', mockBitcoinCoin);

const mockCoins_account2 = new Map();
mockCoins_account2.set('0x123456789', {
  name: 'Wrapped Bitcoin',
  logo: 'https://dynamic-assets.coinbase.com/51bfc85a5a881014b4558bbe8f9758c354a0c831208f189286be93b6b0b86b886a3d656cff4122bac435ec97bd54f08a8d198103dcfab6cae8578bbc1c81afc3/asset_icons/bb1ab3b1677110aea1e1ed5a93f4440d229e01b901de963201417861c57d9add.png',
});
mockCoins_account2.set('0x987654321', {
  name: 'Dogecoin',
  logo: 'https://dynamic-assets.coinbase.com/3803f30367bb3972e192cd3fdd2230cd37e6d468eab12575a859229b20f12ff9c994d2c86ccd7bf9bc258e9bd5e46c5254283182f70caf4bd02cc4f8e3890d82/asset_icons/1597d628dd19b7885433a2ac2d7de6ad196c519aeab4bfe679706aacbf1df78a.png',
});

const mockPendingTransaction: TransactionType = {
  hash: '0x123456789',
  walletIndex: 0,
  amount: '0.100000000000000000',
  ethType: 'transfer',
  network: NetworkType.ETHEREUM,
  type: 'sent',

  initiatedAt: '0',
  completedAt: new Date().toLocaleDateString(),

  ourAddress: '~zod',
  theirPatp: '~bus',
  theirAddress: '0x987654321',

  status: 'pending',
  failureReason: '',

  notes: "I'm a note",
};

const mockSentTransactions: TransactionType[] = Array.from({
  length: 112,
}).map((_, i) => ({
  hash: '0x123456789' + i,
  walletIndex: 0,
  amount: '0.100000000000000000',
  ethType: 'transfer',
  network: NetworkType.ETHEREUM,
  type: 'sent',

  initiatedAt: '0',
  completedAt: new Date().toLocaleDateString(),

  ourAddress: '~zod',
  theirPatp: '~bus',
  theirAddress: '0x987654321' + i,

  status: 'succeeded',
  failureReason: '',

  notes: "I'm a note",
}));

export const mockTransactions: TransactionType[] = [
  mockPendingTransaction,
  ...mockSentTransactions,
];

export const mockWallets: WalletWithKey[] = [
  { ...ethereumWallet1, key: '0' },
  { ...ethereumWallet2, key: '1' },
  { ...bitcoinWallet, key: '2' },
];

export const mockCryptoPunkNft: ERC721Type = {
  name: 'CryptoPunk #70',
  collectionName: 'CryptoPunks',
  address: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
  tokenId: '70',
  imageUrl:
    'https://i.seadn.io/gae/og0ga0_wlsfyF0osZ9HKpu_OzlYOpzTbN_ESHjmNulIS31OAhAWpfoMtRaumfNJ0mZFRmZPnzC-AMCS8m5qjK3bPsKCjdqoaeUeV?auto=format&dpr=1&w=1000',
  lastPrice: '67.00',
  floorPrice: '67.00',
  transactionList: {} as any,
  block: 0,
};

export const mockStarNft: ERC721Type = {
  ...mockCryptoPunkNft,
  name: '~risreg',
  collectionName: 'Azimuth points',
  floorPrice: '4.19',
  tokenId: '0',
  imageUrl:
    'https://openseauserdata.com/files/aaa736022a4d24424f4067f859446f5a.svg',
};
