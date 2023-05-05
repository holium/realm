import log from 'electron-log';

import AbstractDataAccess, {
  DataAccessContructorParams,
} from '../../abstract.db';
import { APIConnection } from '../../api';
import { ChainType, NetworkType, TransactionsRow } from './wallet.types';

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
      app: 'wallet-db',
      path: '/db',
      onEvent: this._onDbUpdate,
      onQuit: this._onQuit,
      onError: this._onError,
    });
    this.init();
  }

  async init() {
    const wallets = await this._fetchWallets();
    this._insertWallets(wallets);
    this.sendUpdate({ type: 'wallets', payload: wallets });
    const transactions = await this._fetchTransactions();
    this._insertTransactions(transactions);
  }

  protected mapRow(row: any): WalletRow {
    return {
      id: row.id,
    };
  }

  async _fetchAll() {
    return await APIConnection.getInstance().conduit.scry({
      app: 'wallet-db',
      path: '/db',
    });
  }

  async _fetchWallets() {
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'wallet-db',
      path: '/db/wallets',
    });
    return response.tables.wallets;
  }

  async _fetchTransactions() {
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'wallet-db',
      path: '/db/transactions',
    });
    return response.tables.transactions;
  }

  private _onDbUpdate(data: any /*WalletDbReactions*/, _id?: number) {
    data.forEach(this._handleDBChange);
  }

  private _handleDBChange(data: any) {
    if (data.type === 'set-row') {
      const addRow = data; // as AddRow;
      console.log('got set-row', addRow);
      switch (addRow.table) {
        case 'wallets':
          this._insertWallets([addRow.row]);
          this.sendUpdate({ type: 'wallet', payload: addRow.row });
          break;
        case 'transactions':
          this._insertTransactions([addRow.row]);
          log.info('sending tx update', {
            type: 'transaction',
            payload: addRow.row,
          });
          this.sendUpdate({ type: 'transaction', payload: addRow.row });
          break;
        default:
          break;
      }
    }
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

  private _insertTransactions(
    transactions: TransactionsRow[],
    contractAddress?: string
  ) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO transactions (
          chain,
          network,
          wallet_id,
          hash,
          eth_type,
          contract_address,
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
          @chain,
          @network,
          @wallet_id,
          @hash,
          @eth_type,
          @contract_address,
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
        console.log('this is tx', tx);
        insert.run({
          chain: tx.chain,
          network: tx.network,
          wallet_id: tx['wallet-id'],
          hash: tx.hash,
          eth_type: tx['eth-type'],
          contract_address: contractAddress,
          type: tx.type,
          initiated_at: tx['initiatedAt'],
          completed_at: tx['completedAt'],
          our_address: tx['ourAddress'],
          their_patp: tx['theirPatp'],
          their_address: tx['theirAddress'],
          status: tx.status,
          failure_reason: tx['failureReason'],
          notes: tx.notes,
        });
      }
    });
    insertMany(transactions);
  }

  private _insertWallets(wallets: any) {
    if (!this.db) throw new Error('No db connection');
    log.info('inserting wallets');
    if (!wallets) return;

    const insert = this.db.prepare(
      `REPLACE INTO wallets (
            chain,
            wallet_index,
            path, 
            address,
            nickname
          ) VALUES (@chain, @wallet_index, @path, @address, @nickname)`
    );
    const insertMany = this.db.transaction((wallets: any) => {
      for (const wallet of wallets)
        insert.run({
          chain: wallet.chain,
          wallet_index: wallet['wallet_index'],
          path: wallet.path,
          address: wallet.address,
          nickname: wallet.nickname,
        });
    });
    console.log('inserting wallets');
    insertMany(wallets);
  }

  getLatestBlock(
    chain: ChainType,
    network: NetworkType,
    walletIndex: number,
    type: string
  ) {
    if (!this.db?.open) return;
    const query = this.db.prepare(
      `select * from chain_info
      where chain = '${chain}' and network = '${network}' and wallet_index = ${walletIndex} and type = '${type}'
      order by block_number desc limit 1`
    );
    const result = query.get();
    return result && result['block_number'];
  }

  setLatestBlock(
    chain: ChainType,
    network: NetworkType,
    walletIndex: number,
    type: string,
    block: number
  ) {
    if (!this.db?.open) return;
    const insert = this.db.prepare(
      `REPLACE INTO chain_info (
        chain,
        network,
        wallet_index,
        type,
        block_number
      ) VALUES (@chain, @network, @wallet_index, @type, @block_number)`
    );
    insert.run({
      chain,
      network,
      wallet_index: walletIndex,
      type,
      block_number: block,
    });
  }

  setBalance(
    chain: ChainType,
    network: NetworkType,
    walletIndex: number,
    type: string,
    balance: string
  ) {
    if (!this.db?.open) return;
    const insert = this.db.prepare(
      `REPLACE INTO chain_info (
        chain,
        network,
        wallet_index,
        type,
        balance
      ) VALUES (@chain, @network, @wallet_index, @type, @balance)`
    );
    insert.run({
      chain,
      network,
      wallet_index: walletIndex,
      type,
      balance,
    });
  }
}

export const walletInitSql = `
create table if not exists transactions
(
  chain          text    not null,
  network        text,
  wallet_id      integer,
  hash           text    not null,
  eth_type       text,
  type           text not null,
  initiated_at   integer not null,
  completed_at   integer,
  our_address    text    not null,
  their_patp     text,
  their_address  text    not null,
  contract_address text,
  status         text    not null,
  failure_reason text,
  notes          text
);

create unique index if not exists hash_network_uindex
  on transactions (chain, network, hash);

drop table if exists wallets;
create table if not exists wallets
(
  chain                       text not null,
  wallet_index                integer not null,
  path                        text not null,
  address                     text not null,
  nickname                    text not null
);

create unique index if not exists chain_wallet_index_uindex
  on wallets (chain, wallet_index);

drop table if exists blocks;
drop table if exists chain_info;
create table if not exists chain_info
(
  chain          text    not null,
  network        text    not null,
  wallet_index   integer not null,
  type           text    not null,
  balance        real,
  block_number   integer
);

create unique index if not exists chain_network_wallet_index_type_uindex
  on chain_info (chain, network, wallet_index, type);
`;

export const walletDBPreload = WalletDB.preload(
  new WalletDB({ preload: true, name: 'walletDB' })
);
