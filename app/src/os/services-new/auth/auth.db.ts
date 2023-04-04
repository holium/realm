import path from 'path';
import { app } from 'electron';
import sqlite3 from 'better-sqlite3';
import Store from 'electron-store';
import log from 'electron-log';
import { AuthStore } from '../../services/identity/auth.model';
import { Accounts, accountsInit } from './accounts.table';
import { SessionType } from './auth.service';
import { MasterAccounts, masterAccountsInit } from './masterAccounts.table';

export class AuthDB {
  private readonly authDB: sqlite3.Database;
  tables: {
    accounts: Accounts;
    masterAccounts: MasterAccounts;
  };

  constructor() {
    // Open the authentication database
    this.authDB = new sqlite3(
      path.join(app.getPath('userData'), 'auth.sqlite'),
      {}
    );
    this.authDB.pragma('journal_mode = WAL');
    this.authDB.pragma('foreign_keys = ON');
    this.authDB.exec(initSql);

    const result = this.authDB
      .prepare('SELECT migrated FROM accounts_meta LIMIT 1;')
      .all();

    const migrated = result[0]?.migrated || null;
    if (!migrated) this.migrateJsonToSqlite();
    this.tables = {
      accounts: new Accounts(this.authDB),
      masterAccounts: new MasterAccounts(this.authDB),
    };

    app.on('quit', () => {
      this.disconnect();
    });
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

  public _setSession(patp: string, cookie: string) {
    log.info(`Setting session for ${patp} to ${cookie}`);
    const query = this.authDB.prepare(`
      REPLACE INTO accounts_session (patp, key, createdAt)
      VALUES (?, ?, ?);
    `);
    query.run(patp, cookie, Date.now());
  }

  public _getSession(patp?: string): SessionType | null {
    const query = this.authDB.prepare(
      patp
        ? `
      SELECT patp, key FROM accounts_session WHERE patp = ?;
    `
        : `SELECT patp, key FROM accounts_session LIMIT 1;`
    );
    const result = patp ? query.get(patp) : query.get();
    if (result) {
      return result;
    }
    return null;
  }

  public _clearSession(patp?: string): void {
    const query = this.authDB.prepare(
      patp
        ? `
      DELETE FROM accounts_session WHERE patp = ?;
    `
        : `DELETE FROM accounts_session;`
    );
    patp ? query.run(patp) : query.run();
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
  migrated            INTEGER NOT NULL DEFAULT 0,
  migratedAt          INTEGER
);

create table if not exists accounts_session (
  patp          TEXT PRIMARY KEY NOT NULL,
  key           TEXT NOT NULL,
  createdAt     INTEGER
);
`;
