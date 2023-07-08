import Database from 'better-sqlite3-multiple-ciphers';

import { MobXAccount } from 'renderer/stores/models/account.model';

import AbstractDataAccess from '../abstract.db';

export type DBAccount = Omit<MobXAccount, 'theme'> & {
  theme: string;
};

export class Accounts extends AbstractDataAccess<DBAccount, any> {
  constructor(db: Database) {
    super({
      preload: false,
      db,
      name: 'accounts',
      tableName: 'accounts',
      pKey: 'serverId',
    });
  }

  protected mapRow(row: any): DBAccount {
    return {
      accountId: row.accountId,
      serverId: row.serverId,
      serverUrl: row.serverUrl,
      serverType: row.serverType,
      nickname: row.nickname,
      description: row.description,
      color: row.color,
      avatar: row.avatar,
      status: row.status,
      theme: row.theme ? JSON.parse(row.theme) : {},
      passwordHash: row.passwordHash,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

export const accountsInitSql = `
  create table if not exists accounts (
    accountId       INTEGER,
    serverId        TEXT PRIMARY KEY NOT NULL,
    serverCode      TEXT,
    serverUrl       TEXT NOT NULL,
    serverType      TEXT NOT NULL DEFAULT 'local',
    nickname        TEXT,
    description     TEXT,
    color           TEXT default '#000000',
    avatar          TEXT,
    status          TEXT NOT NULL DEFAULT 'initial',
    theme           TEXT,
    passwordHash    TEXT,
    createdAt       INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updatedAt       INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    FOREIGN KEY (accountId) REFERENCES master_accounts(id) ON DELETE CASCADE

  );
  create unique index if not exists accounts_server_id_uindex on accounts (serverId);
`;

export const accountsWipeSql = `drop table if exists accounts;`;
