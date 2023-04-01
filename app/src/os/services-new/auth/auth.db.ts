import path from 'path';
import { app } from 'electron';
import sqlite3 from 'better-sqlite3';
import Store from 'electron-store';
import log from 'electron-log';
import { AuthStore } from '../../services/identity/auth.model';
import { Accounts, accountsInit } from './models/accounts.db';
import {
  AccountsOnboarding,
  accountsOnboardingInit,
} from './models/accountsOnboarding.db';

export class AuthDB {
  private readonly authDB: sqlite3.Database;
  models: {
    accounts: Accounts;
    accountsOnboarding: AccountsOnboarding;
  };

  constructor() {
    // Open the authentication database
    this.authDB = new sqlite3(
      path.join(app.getPath('userData'), 'auth.sqlite'),
      {}
    );
    this.authDB.pragma('journal_mode = WAL');
    this.authDB.exec(initSql);

    const result = this.authDB
      .prepare('SELECT migrated FROM accounts_meta LIMIT 1;')
      .all();

    const migrated = result[0]?.migrated || null;
    if (!migrated) this.migrateJsonToSqlite();
    this.models = {
      accounts: new Accounts(this.authDB),
      accountsOnboarding: new AccountsOnboarding(this.authDB),
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

  disconnect() {
    this.authDB.close();
  }
}

const initSql = `

${accountsOnboardingInit}

create table if not exists accounts_onboarding_meta (
  firstTime           INTEGER NOT NULL DEFAULT 1,
  agreedToDisclaimer  INTEGER NOT NULL DEFAULT 0,
  agreedAt            INTEGER
);

${accountsInit}

create table if not exists accounts_order (
  patp          TEXT PRIMARY KEY NOT NULL,
  idx           INTEGER NOT NULL
);

create table if not exists accounts_meta (
  migrated            INTEGER NOT NULL DEFAULT 0,
  migratedAt          INTEGER
);

`;
