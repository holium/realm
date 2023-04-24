import path from 'path';
import { app } from 'electron';
import Database from 'better-sqlite3-multiple-ciphers';
import log from 'electron-log';
import crypto from 'crypto';
import { spacesTablesInitSql } from './spaces/spaces.service';
import { bazaarTablesInitSql } from './spaces/tables/catalog.table';
import { notifInitSql } from './notifications/notifications.table';
import { chatInitSql } from './chat/chat.db';
import { friendsInitSql } from './friends.service';
import { walletInitSql } from './wallet/wallet.db';

export class ShipDB {
  private shipDB: Database;
  private patp: string;

  private readonly dbPath: string;
  private readonly dontEncryptDb: boolean =
    process.env.DONT_ENCRYPT_DB === 'true';

  constructor(patp: string, password: string, clientSideEncryptionKey: string) {
    this.patp = patp;
    this.dbPath = path.join(app.getPath('userData'), `${patp}.sqlite`);

    // Create the database if it doesn't exist
    log.info('ship.db.ts:', 'ship db file doesnt exist');
    if (this.dontEncryptDb) {
      this.shipDB = new Database(this.dbPath);
      this.shipDB.exec(initSql);
      return;
    } else {
      log.info('ship.db.ts:', 'Encrypting ship db');
      const hashGenerator = crypto.createHmac(
        'sha256',
        clientSideEncryptionKey
      );
      const passwordHash = hashGenerator.update(password).digest('hex');

      this.shipDB = new Database(this.dbPath, {
        key: passwordHash,
      });
      this.shipDB.exec(initSql);
    }
  }

  get db() {
    return this.shipDB;
  }

  public decrypt(password: string) {
    if (!this.db.open) {
      throw new Error('Database is not open');
    }
    this.db.exec(`PRAGMA key = '${password}'`);
  }

  public encrypt(password: string) {
    if (!this.db.open) {
      throw new Error('Database is not open');
    }
    this.db.exec(`PRAGMA rekey = '${password}'`);
  }

  getCredentials(): {
    url: string;
    code: string;
    cookie: string;
  } {
    const result: any = this.shipDB
      .prepare('SELECT * FROM credentials LIMIT 1;')
      .get();
    return { ...result, ship: this.patp };
  }

  setCredentials(url: string, code: string, cookie: string) {
    this.shipDB
      .prepare(
        'INSERT OR REPLACE INTO credentials (url, code, cookie) VALUES (?, ?, ?);'
      )
      .run(url, code, cookie);
  }

  getMessages() {
    return this.shipDB.prepare('SELECT * FROM messages;').all();
  }

  disconnect() {
    this.shipDB.close();
  }
}

const initSql = `
${bazaarTablesInitSql}
${chatInitSql}
${notifInitSql}
${friendsInitSql}
${spacesTablesInitSql}
${walletInitSql}
create table if not exists credentials (
  url       TEXT PRIMARY KEY NOT NULL,
  code      TEXT NOT NULL,
  cookie    TEXT NOT NULL,
  wallet    TEXT
);
`;
