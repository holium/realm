import { Database } from 'better-sqlite3';
import AbstractDataAccess from '../../abstract.db';

export interface Account {
  onboardingId: number;
  patp: string;
  url: string;
  nickname: string;
  color: string;
  avatar: string;
  status: string;
  theme: string;
  passwordHash: string;
  createdAt: number;
  updatedAt: number;
}

export class Accounts extends AbstractDataAccess<Account> {
  constructor(db: Database) {
    super({ preload: false, db, name: 'accounts', tableName: 'accounts' });
  }

  protected mapRow(row: any): Account {
    return {
      onboardingId: row.onboardingId,
      patp: row.patp,
      url: row.url,
      nickname: row.nickname,
      color: row.color,
      avatar: row.avatar,
      status: row.status,
      theme: row.theme ? JSON.parse(row.theme) : {},
      passwordHash: row.passwordHash,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  public findOne(patp: string): Account | null {
    const query = `SELECT * FROM ${this.tableName} WHERE patp = ?`;
    const stmt = this.prepare(query);
    const row = stmt.get(patp);
    return row ? this.mapRow(row) : null;
  }

  public create(values: Partial<Account>): Account {
    const columns = Object.keys(values).join(', ');
    const placeholders = Object.keys(values)
      .map(() => '?')
      .join(', ');
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const stmt = this.prepare(query);

    stmt.run(Object.values(values));
    if (!values.patp) throw new Error('Failed to create new record');
    const created = this.findOne(values.patp);
    if (!created) throw new Error('Failed to create new record');
    return created;
  }

  public update(patp: string, values: Partial<Account>): Account {
    const setClause = Object.keys(values)
      .map((key) => `${key} = ?`)
      .join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE patp = ?`;
    const stmt = this.prepare(query);

    stmt.run([...Object.values(values), patp]);
    const updated = this.findOne(patp);
    if (!updated) throw new Error('Failed to update record');
    return updated;
  }

  public delete(patp: string): void {
    const query = `DELETE FROM ${this.tableName} WHERE patp = ?`;
    const stmt = this.prepare(query);

    const result = stmt.run(patp);
    if (result.changes !== 1) throw new Error('Failed to delete record');
  }
}

export const accountsInit = `
  create table if not exists accounts (
    onboardingId    INTEGER REFERENCES accounts_onboarding(id) ON DELETE CASCADE,
    accountId       TEXT NOT NULL,
    patp            TEXT PRIMARY KEY NOT NULL,
    url             TEXT NOT NULL,
    nickname        TEXT,
    color           TEXT default '#000000',
    avatar          TEXT,
    status          TEXT NOT NULL DEFAULT 'initial',
    theme           TEXT,
    passwordHash    TEXT,
    createdAt       INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updatedAt       INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
  );
  create unique index if not exists accounts_patp_uindex on accounts (patp);
`;
