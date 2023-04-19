import AbstractDataAccess, {
  DataAccessContructorParams,
} from '../../abstract.db';
import { APIConnection } from '../../api';
import { TransactionsRow, WalletDbOps } from './wallet.types';

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
    this._handleDBChange = this._handleDBChange.bind(this);
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
    console.log('fetched wallets', wallets);
    this._insertWallets(wallets);
    // this._insertTransactions(wallets.transactions);
  }

  protected mapRow(row: any): WalletRow {
    return {
      id: row.id,
      app: row.app,
      path: row.path,
      type: row.type,
      title: row.title,
      content: row.content,
      image: row.image,
      buttons: row.buttons ? JSON.parse(row.buttons) : null,
      link: row.link,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      createdAt: row['created-at'],
      updatedAt: row['updated-at'],
      readAt: row['read-at'],
      read: row.read === 1,
      dismissedAt: row['dismissed-at'],
      dismissed: row.dismissed === 1,
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
    console.log('sending wallet update', data);
    this.sendUpdate(data);
    /*if ('tables' in data) {
      this._insertTransactions(data.tables.transactions);
      this._insertWallets(data.tables.wallets);
    } else if (Array.isArray(data)) {
      if (
        data.length > 1 &&
        data[0].type === 'add-row' &&
        data[0].table === 'transactions'
      ) {
        const transactions = data.map(
          (row) => (row as AddRow).row as WalletsRow
        ) as TransactionsRow[];
        this._insertTransactions(transactions);
        const msg = this.getChatMessage(transactions[0]['msg-id']);
        this.sendUpdate({ type: 'transaction-received', payload: msg });
      } else {
        data.forEach(this._handleDBChange);
      }
    } else {
      console.log(data);
    }*/
  }

  private _handleDBChange(dbChange: WalletDbOps) {
    /*if (dbChange.type === 'add-row') {
      const addRow = dbChange as AddRow;
      switch (addRow.table) {
        case 'transactions':
          const message = addRow.row as TransactionsRow;
          this._insertTransactions([message]);
          const msg = this.getChatMessage(message['msg-id']);
          this.sendUpdate({ type: 'message-received', payload: msg });
          break;
        case 'wallets':
          const path = addRow.row as WalletsRow;
          this._insertWallets([path]);
          const chat = this.getChat(path.path);
          this.sendUpdate({ type: 'path-added', payload: chat });
          break;
      }
    }
    if (dbChange.type === 'update') {
      const update = dbChange as UpdateRow;
      switch (update.table) {
        case 'transactions':
          const message = update as UpdateTransaction;
          const msgId = message.message[0]['msg-id'];
          this._insertTransactions(message.message);
          const msg = this.getChatMessage(msgId);
          this.sendUpdate({ type: 'message-edited', payload: msg });
          break;
        case 'wallets':
          const path = update.row as WalletsRow;
          this._insertWallets([path]);
          const chat = this.getChat(path.path);
          this.sendUpdate({ type: 'path-updated', payload: chat });
          break;
      }
    }*/
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
    const insertMany = this.db.transaction((transactions) => {
      for (const tx of transactions) {
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
            address,
            nickname
          ) VALUES (@path, @address, @nickname)`
    );
    const insertMany = this.db.transaction((wallets) => {
      for (const wallet of wallets)
        insert.run({
          path: wallet.path,
          address: wallet.address,
          nickname: wallet.nickname,
        });
    });
    const ethWallets = Object.values(wallets.wallets.ethereum);
    const btcWallets = Object.values(wallets.wallets.bitcoin);
    const btcTestWallets = Object.values(wallets.wallets.btctestnet);
    insertMany(ethWallets);
    insertMany(btcWallets);
    insertMany(btcTestWallets);
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
    path                        TEXT not null,
    address                     TEXT not null,
    nickname                    TEXT not null
);

create unique index if not exists path_uindex
    on wallets (path);
`;

export const walletDBPreload = WalletDB.preload(
  new WalletDB({ preload: true, name: 'walletDB' })
);
