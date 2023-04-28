import Database from 'better-sqlite3-multiple-ciphers';

import AbstractDataAccess from '../abstract.db';

export interface MasterAccount {
  id: number;
  email: string;
  encryptionKey: string;
  passwordHash: string;
  authToken?: string;
}

export class MasterAccounts extends AbstractDataAccess<MasterAccount> {
  constructor(db: Database) {
    super({
      preload: false,
      db,
      name: 'masterAccounts',
      tableName: 'master_accounts',
    });
  }

  protected mapRow(row: any): MasterAccount {
    return {
      id: row.id,
      email: row.email,
      encryptionKey: row.encryptionKey,
      passwordHash: row.passwordHash,
      authToken: row.authToken,
    };
  }

  public update(id: number, values: Partial<MasterAccount>): MasterAccount {
    const setClause = Object.keys(values)
      .map((key) => `${key} = ?`)
      .join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    const stmt = this.prepare(query);

    stmt.run([...Object.values(values), id]);
    const updated = this.findOne(id);
    if (!updated) throw new Error('Failed to update record');
    return updated;
  }
}

export const masterAccountsInit = `
  create table if not exists master_accounts (
    id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    email           TEXT NOT NULL,
    encryptionKey   TEXT NOT NULL,
    passwordHash    TEXT NOT NULL,
    authToken       TEXT
  );
  create unique index if not exists master_email_uindex on master_accounts (email);
`;
