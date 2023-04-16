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
