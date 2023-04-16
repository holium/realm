import { Database } from 'better-sqlite3';
import AbstractDataAccess from '../abstract.db';

export interface MasterAccount {
  id: number;
  email: string;
  encryptionKey: string;
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
      authToken: row.authToken,
    };
  }
}

export const masterAccountsInit = `
  create table if not exists master_accounts (
    id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    email           TEXT NOT NULL,
    encryptionKey   TEXT NOT NULL,
    authToken       TEXT
  );
  create unique index if not exists master_email_uindex on master_accounts (email);
`;
