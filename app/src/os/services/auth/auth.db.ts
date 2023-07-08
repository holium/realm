import { app } from 'electron';
import Database from 'better-sqlite3-multiple-ciphers';

import { Migration, MigrationService } from '../migration/migration.service';
import { Accounts, accountsInitSql, accountsWipeSql } from './accounts.table';
import {
  MasterAccounts,
  masterAccountsInitSql,
  masterAccountsWipeSql,
} from './masterAccounts.table';

const initSql = `
${accountsInitSql}
${masterAccountsInitSql}
create table if not exists accounts_order (
  serverId      TEXT PRIMARY KEY NOT NULL,
  idx           INTEGER NOT NULL
);

create table if not exists accounts_meta (
  seenSplash    INTEGER NOT NULL DEFAULT 0,
  migrated      INTEGER NOT NULL DEFAULT 0,
  migratedAt    INTEGER
);
`;

const wipeSql = `
${accountsWipeSql}
${masterAccountsWipeSql}
drop table if exists accounts_order;
drop table if exists accounts_meta;
`;

const migrations: Migration[] = [
  {
    version: 1,
    up: `${initSql}`,
    down: `${wipeSql}`,
  },
  {
    version: 2,
    up: `ALTER TABLE accounts DROP COLUMN serverCode;`,
    down: `ALTER TABLE accounts ADD COLUMN serverCode TEXT;`,
  },
];

export class AuthDB {
  private readonly authDB: Database;
  tables: {
    accounts: Accounts;
    masterAccounts: MasterAccounts;
  };

  constructor() {
    this.authDB = MigrationService.getInstance().setupAndMigrate(
      'auth',
      migrations,
      2
    );

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
