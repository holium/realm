import path from 'path';
import { app } from 'electron';
import Database from 'better-sqlite3-multiple-ciphers';
import Store from 'electron-store';
import log from 'electron-log';
import { Accounts, accountsInit } from './accounts.table';
import { MasterAccounts, masterAccountsInit } from './masterAccounts.table';
import { AuthStore } from './auth.model.old';

export class AuthDB {
  private readonly authDB: Database;
  tables: {
    accounts: Accounts;
    masterAccounts: MasterAccounts;
  };

  constructor() {
    // Open the authentication database
    this.authDB = new Database(
      path.join(app.getPath('userData'), 'auth.sqlite'),
      {}
    );
    this.authDB.pragma('journal_mode = WAL');
    this.authDB.pragma('foreign_keys = ON');
    this.authDB.exec(initSql);

    const result: any = this.authDB
      .prepare('SELECT migrated FROM accounts_meta LIMIT 1;')
      .all();

    const migrated = false; // result[0]?.migrated || null;
    console.log('migrated', migrated);
    if (!migrated) this.migrateJsonToSqlite();
    this.tables = {
      accounts: new Accounts(this.authDB),
      masterAccounts: new MasterAccounts(this.authDB),
    };

    app.on('quit', () => {
      this.disconnect();
    });
  }

  hasSeenSplash(): boolean {
    const result: any = this.authDB
      .prepare('SELECT seenSplash FROM accounts_meta;')
      .all();
    if (result.length === 0) return false;
    return result[0]?.seenSplash === 1 || false;
  }

  setSeenSplash(): void {
    this.authDB.prepare('UPDATE accounts_meta SET seenSplash = 1;').run();
  }

  migrateJsonToSqlite() {
    try {
      const oldAuth = new Store({
        name: 'realm.auth',
        accessPropertiesByDotNotation: true,
        defaults: AuthStore.create({ firstTime: true }),
      });
      // if realm.auth is empty, don't migrate
      if (!oldAuth.store || Object.keys(oldAuth.store).length === 0) {
        log.info('No realm.auth.json to migrate -> skipping');
        return;
      }
      log.info('Migrating realm.auth.json to sqlite');
      const oldTheme = new Store({
        name: 'realm.auth-theme',
        accessPropertiesByDotNotation: true,
      });
      // loop through ships and insert into accounts table
      Object.values(oldAuth.store.ships).forEach((ship: any) => {
        log.info(ship);
        const theme = oldTheme.store[ship.patp];
        const query = this.authDB.prepare(`
          INSERT INTO accounts (url, patp, nickname, color, avatar, status, theme, passwordHash)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `);
        query.run(
          ship.url,
          ship.patp,
          ship.nickname,
          ship.color,
          ship.avatar,
          ship.status,
          theme ? JSON.stringify(theme) : JSON.stringify({}),
          ship.passwordHash
        );
      });
      oldAuth.store.order.forEach((patp: string, index: number) => {
        const query = this.authDB.prepare(`
        REPLACE INTO accounts_order (patp, idx)
        VALUES (?, ?);
      `);
        query.run(patp.replace('auth', ''), index);
      });
      // TODO clear old auth store
    } catch (error) {
      log.error(error);
    }
    this.authDB
      .prepare(
        'REPLACE INTO accounts_meta (migrated, migratedAt) VALUES (1, ?);'
      )
      .run(Date.now());
  }

  public addToOrder(patp: string): void {
    const query = this.authDB.prepare(`
      REPLACE INTO accounts_order (patp, idx)
      VALUES (?, ?);
    `);
    query.run(patp, this.getOrder().length);
  }

  public removeFromOrder(patp: string): void {
    const query = this.authDB.prepare(`
      DELETE FROM accounts_order WHERE patp = ?;
    `);
    query.run(patp);
  }

  public getOrder(): string[] {
    const query = this.authDB.prepare(`
      SELECT patp FROM accounts_order ORDER BY idx ASC;
    `);
    const result: any = query.all();
    return result.map((r: { patp: string }) => r.patp);
  }

  public setOrder(patp: string, idx: number): void {
    const query = this.authDB.prepare(`
      REPLACE INTO accounts_order (patp, idx)
      VALUES (?, ?);
    `);
    query.run(patp, idx);
  }

  disconnect() {
    this.authDB.close();
  }
}

const initSql = `
${accountsInit}
${masterAccountsInit}
create table if not exists accounts_order (
  patp          TEXT PRIMARY KEY NOT NULL,
  idx           INTEGER NOT NULL
);

create table if not exists accounts_meta (
  seenSplash          INTEGER NOT NULL DEFAULT 0,
  migrated            INTEGER NOT NULL DEFAULT 0,
  migratedAt          INTEGER
);

create table if not exists accounts_session (
  patp          TEXT PRIMARY KEY NOT NULL,
  key           TEXT NOT NULL,
  createdAt     INTEGER
);
`;
