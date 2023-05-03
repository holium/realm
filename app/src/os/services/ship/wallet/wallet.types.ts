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

export enum WalletCreationMode {
  DEFAULT = 'default',
  ON_DEMAND = 'on-demand',
}

export enum SharingMode {
  NOBODY = 'nobody',
  FRIENDS = 'friends',
  ANYBODY = 'anybody',
}

export interface UISettingsType {
  walletCreationMode: WalletCreationMode;
  sharingMode: SharingMode;
  blocked: string[];
  defaultIndex: number;
  provider: string;
}

export type TransactionsRow = {
  hash: string;
  network: string;
  type: number;
  initiatedAt: number;
  completedAt: number | undefined;
  ourAddress: string;
  theirPatp: string | undefined;
  theirAddres: string;
  status: string;
  failureReason: string | undefined;
  notes: string;
};

export type WalletsRow = {};

export type WalletTables = 'messages' | 'paths' | 'peers';
export type DbChangeType =
  | 'del-peers-row'
  | 'del-paths-row'
  | 'del-messages-row'
  | 'add-row'
  | 'update';

export type AddRow = {
  table: WalletTables;
  type: 'add-row';
  row: TransactionsRow | WalletsRow;
};

export type UpdateRow = {
  table: WalletTables;
  type: 'update';
  row: TransactionsRow | WalletsRow;
};

export type UpdateTransaction = {
  table: 'transactions';
  type: 'update';
  transaction: TransactionsRow[];
};

export type DelTransactionsRow = {
  table: WalletTables;
  type: 'del-transactions-row';
  row: string;
  ship: string;
  timestamp: number;
};
export type DelWalletsRow = {
  table: WalletTables;
  type: 'del-wallets-row';
  row: string;
  timestamp: number;
};
export type DelMessagesRow = {
  table: WalletTables;
  type: 'del-messages-row';
  path: string;
  'msg-id': string;
  timestamp: number;
};

export type WalletDbOps = DelTransactionsRow | UpdateRow;

export type DeleteLogRow = {
  change: DelTransactionsRow | DelWalletsRow;
  timestamp: number;
};

export type WalletDbChangeReactions =
  | AddRow[]
  | DelTransactionsRow[]
  | DelWalletsRow[];

export type WalletDbReactions =
  | {
      tables: {
        transactions: TransactionsRow[];
        wallets: WalletsRow[];
      };
    }
  | WalletDbChangeReactions;
