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
      serverCode: row.serverCode,
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

  public findOne(serverId: string): DBAccount | null {
    const query = `SELECT * FROM ${this.tableName} WHERE serverId = ?`;
    const stmt = this.prepare(query);
    const row = stmt.get(serverId);
    return row ? this.mapRow(row) : null;
  }

  public findAll(accountId: number): DBAccount[] {
    const query = `SELECT * FROM ${this.tableName} WHERE accountId = ?`;
    const stmt = this.prepare(query);
    const rows = stmt.all(accountId);
    return rows.map((row) => this.mapRow(row));
  }

  public create(values: Partial<DBAccount>): DBAccount {
    const columns = Object.keys(values).join(', ');
    const placeholders = Object.keys(values)
      .map(() => '?')
      .join(', ');
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const stmt = this.prepare(query);

    stmt.run(Object.values(values));
    if (!values.serverId) throw new Error('Failed to create new record');
    const created = this.findOne(values.serverId);
    if (!created) throw new Error('Failed to create new record');
    return created;
  }

  public update(serverId: string, values: Partial<DBAccount>): DBAccount {
    const setClause = Object.keys(values)
      .map((key) => `${key} = ?`)
      .join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE serverId = ?`;
    const stmt = this.prepare(query);

    stmt.run([...Object.values(values), serverId]);
    const updated = this.findOne(serverId);
    if (!updated) throw new Error('Failed to update record');
    return updated;
  }

  public delete(serverId: string): void {
    const query = `DELETE FROM ${this.tableName} WHERE serverId = ?`;
    const stmt = this.prepare(query);

    const result = stmt.run(serverId);
    if (result.changes !== 1) throw new Error('Failed to delete record');
  }
}

export const accountsInit = `
  create table if not exists accounts (
    accountId       INTEGER,
    serverId        TEXT PRIMARY KEY NOT NULL,
    serverUrl       TEXT NOT NULL,
    serverCode      TEXT NOT NULL,
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
