import { app } from 'electron';
import log from 'electron-log';
import Store from 'electron-store';
import Database from 'better-sqlite3-multiple-ciphers';
import path from 'path';

import { Accounts, accountsInit } from './accounts.table';
import { AuthStore } from './auth.model.old';
import { MasterAccounts, masterAccountsInit } from './masterAccounts.table';

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
    this.authDB
      .prepare(
        'REPLACE INTO accounts_meta (seenSplash, migrated) VALUES (1, 0);'
      )
      .run();
  }

  _needsMigration(): boolean {
    const result: any = this.authDB
      .prepare('SELECT migrated FROM accounts_meta LIMIT 1;')
      .all();

    return !(result[0]?.migrated || null);
  }

  migrateJsonToSqlite(masterAccountId: number) {
    try {
      const oldAuth = new Store({
        name: 'realm.auth',
        accessPropertiesByDotNotation: true,
        defaults: AuthStore.create({ firstTime: true }),
      });
      // if realm.auth is empty, don't migrate
      if (!oldAuth.store || Object.keys(oldAuth.store).length === 0) {
        log.info('auth.db.ts:', 'No realm.auth.json to migrate -> skipping');
        return;
      }
      log.info('auth.db.ts:', 'Migrating realm.auth.json to sqlite');
      const oldTheme = new Store({
        name: 'realm.auth-theme',
        accessPropertiesByDotNotation: true,
      });
      // loop through ships and insert into accounts table
      oldAuth.store.ships.forEach((ship) => {
        const theme = oldTheme.store[ship.patp];
        const query = this.authDB.prepare(`
        INSERT INTO accounts (accountId, serverUrl, serverId, serverType, nickname, color, avatar, status, theme, passwordHash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);
        query.run(
          masterAccountId,
          ship.url,
          ship.patp,
          'local',
          ship.nickname,
          ship.color,
          ship.avatar,
          ship.status,
          theme ? JSON.stringify(theme) : JSON.stringify({}),
          ship.passwordHash
        );
      });
      oldAuth.store.order.forEach((serverId: string, index: number) => {
        const query = this.authDB.prepare(`
        REPLACE INTO accounts_order (serverId, idx)
        VALUES (?, ?);
      `);
        query.run(serverId.replace('auth', ''), index);
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

  public addToOrder(serverId: string): void {
    const query = this.authDB.prepare(`
      REPLACE INTO accounts_order (serverId, idx)
      VALUES (?, ?);
    `);
    query.run(serverId, this.getOrder().length);
  }

  public removeFromOrder(serverId: string): void {
    const query = this.authDB.prepare(`
      DELETE FROM accounts_order WHERE serverId = ?;
    `);
    query.run(serverId);
  }

  public getOrder(): string[] {
    const query = this.authDB.prepare(`
      SELECT serverId FROM accounts_order ORDER BY idx ASC;
    `);
    const result: any = query.all();
    return result.map((r: { serverId: string }) => r.serverId);
  }

  public setOrder(serverId: string, idx: number): void {
    const query = this.authDB.prepare(`
      REPLACE INTO accounts_order (serverId, idx)
      VALUES (?, ?);
    `);
    query.run(serverId, idx);
  }

  disconnect() {
    this.authDB.close();
  }
}

const initSql = `
${accountsInit}
${masterAccountsInit}
create table if not exists accounts_order (
  serverId      TEXT PRIMARY KEY NOT NULL,
  idx           INTEGER NOT NULL
);

create table if not exists accounts_meta (
  seenSplash    INTEGER NOT NULL DEFAULT 0,
  migrated      INTEGER NOT NULL DEFAULT 0,
  migratedAt    INTEGER
);

create table if not exists accounts_session (
  serverId      TEXT PRIMARY KEY NOT NULL,
  key           TEXT NOT NULL,
  createdAt     INTEGER
);
`;
