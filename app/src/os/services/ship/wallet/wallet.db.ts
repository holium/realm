import AbstractDataAccess, {
  DataAccessContructorParams,
} from '../../abstract.db';
import { APIConnection } from '../../api';

import { TransactionsRow } from './wallet.types';

interface WalletRow {}

export class WalletDB extends AbstractDataAccess<WalletRow> {
  constructor(params: DataAccessContructorParams) {
    params.name = 'walletDB';
    params.tableName = 'wallets';
    params.tableName = 'transactions';
    super(params);
    if (params.preload) return;
    this._onQuit = this._onQuit.bind(this);
    this._onError = this._onError.bind(this);
    this._onDbUpdate = this._onDbUpdate.bind(this);
    this.init = this.init.bind(this);
    APIConnection.getInstance().conduit.watch({
      app: 'realm-wallet',
      path: '/updates',
      onEvent: this._onDbUpdate,
      onQuit: this._onQuit,
      onError: this._onError,
    });
    this.init();
  }

  async init() {
    const wallets = await this._fetchWallets();
    this._insertWallets(wallets);
    /*const ethWallets = wallets.wallets.ethereum;
    let wallet: any;
    for (wallet of Object.values(ethWallets)) {
      this._insertTransactions(wallet.transactions);
      this._insertTransactions(wallet['token-txns']);
    }*/
    // this._insertTransactions(wallets.transactions);
  }

  protected mapRow(row: any): WalletRow {
    return {
      id: row.id,
    };
  }
  //
  // Fetches
  //
  async fetchMuted() {
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'realm-chat',
      path: '/mutes',
    });
    return response;
  }

  private async _fetchWallets() {
    // const lastTimestamp = this.getLastTimestamp('wallets');
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'realm-wallet',
      path: '/wallets', // `/${lastTimestamp}`,
    });
    return response;
  }

  private _onDbUpdate(data: any /*WalletDbReactions*/, _id?: number) {
    console.log('sending update', data);
    this.sendUpdate(data);
  }

  sendChainUpdate(data: any) {
    this.sendUpdate(data);
  }

  private _onQuit() {
    console.log('fail!');
  }
  private _onError(err: any) {
    console.log('err!', err);
  }
  private _parseMetadata = (metadata: string) => {
    const mtd = JSON.parse(metadata);
    return {
      ...mtd,
      timestamp: parseInt(mtd.timestamp) || 0,
      reactions: mtd.reactions === 'true',
    };
  };
  // ----------------------------------------------
  // ----------------- DB queries -----------------
  // ----------------------------------------------

  getWallets() {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
      SELECT * FROM wallets
    `);
    return query.all();
  }

  getTransactions() {
    if (!this.db) throw new Error('No db connection');
    const query = this.db.prepare(`
      SELECT * FROM transactions
    `);
    return query.all();
  }

  getLastTimestamp(
    table: 'paths' | 'messages' | 'peers' | 'delete_logs' | 'notifications'
  ): number {
    if (!this.db) throw new Error('No db connection');
    const column = table === 'delete_logs' ? 'timestamp' : 'updated_at';
    const query = this.db.prepare(`
        SELECT max(${column}) as lastTimestamp
        FROM ${table};
      `);
    const result: any = query.all();
    // add 1 to avoid getting same timestamp again
    return result[0]?.lastTimestamp + 1 || 0;
  }

  //
  // Inserts
  //

  private _insertTransactions(transactions: TransactionsRow[]) {
    if (!this.db) throw new Error('No db connection');
    console.log('transactions', transactions);
    const insert = this.db.prepare(
      `REPLACE INTO transactions (
          hash,
          network,
          type,
          initiated_at,
          completed_at,
          our_address,
          their_patp,
          their_address,
          status,
          failure_reason,
          notes
        ) VALUES (
          @hash,
          @network,
          @type,
          @initiated_at,
          @completed_at,
          @our_address,
          @their_patp,
          @their_address,
          @status,
          @failure_reason,
          @notes
        )`
    );
    const insertMany = this.db.transaction((transactions: any) => {
      let tx: any;
      for (tx of Object.values(transactions)) {
        insert.run({
          hash: tx.hash,
          network: tx.network,
          type: tx.type,
          initiated_at: tx['initiated-at'],
          completed_at: tx['completed-at'],
          our_address: tx['our-address'],
          their_patp: tx['their-patp'],
          their_address: tx['their-address'],
          status: tx.status,
          failure_reason: tx['failure-reason'],
          notes: tx.notes,
        });
      }
    });
    insertMany(transactions);
  }

  private _insertWallets(wallets: any) {
    if (!this.db) throw new Error('No db connection');
    if (!wallets) return;

    const insert = this.db.prepare(
      `REPLACE INTO wallets (
            path, 
            wallet_index,
            address,
            nickname
          ) VALUES (@path, @wallet_index, @address, @nickname)`
    );
    const insertMany = this.db.transaction((wallets: any) => {
      let index: string;
      let wallet: any;
      for ([index, wallet] of Object.entries(wallets))
        insert.run({
          path: wallet.path,
          wallet_index: index,
          address: wallet.address,
          nickname: wallet.nickname,
        });
    });
    const ethWallets = wallets.wallets.ethereum;
    const btcWallets = wallets.wallets.bitcoin;
    const btcTestWallets = wallets.wallets.btctestnet;
    insertMany(ethWallets);
    insertMany(btcWallets);
    insertMany(btcTestWallets);
  }

  getLatestBlock() {
    return 0;
  }
}

export const walletInitSql = `
create table if not exists transactions
(
  hash           text    not null,
  network        text    not null,
  type           text    not null,
  initiated_at   integer not null,
  completed_at   integer,
  our_address    text    not null,
  their_patp     text,
  their_address  text    not null,
  status         text    not null,
  failure_reason text,
  notes          text
);

create unique index if not exists hash_network_uindex
    on transactions (hash, network);

create table if not exists wallets
(
    path                        text not null,
    wallet_index                integer not null,
    address                     text not null,
    nickname                    text not null
);

create unique index if not exists path_uindex
    on wallets (path);
`;

export const walletDBPreload = WalletDB.preload(
  new WalletDB({ preload: true, name: 'walletDB' })
);
