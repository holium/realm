import { app } from 'electron';
import log from 'electron-log';
import Database from 'better-sqlite3-multiple-ciphers';
import crypto from 'crypto';
import path from 'path';

import { chatInitSql } from './chat/chat.db';
import { friendsInitSql } from './friends.service';
import { notifInitSql } from './notifications/notifications.table';
import { Credentials } from './ship.types.ts';
import { spacesTablesInitSql } from './spaces/spaces.service';
import { bazaarTablesInitSql } from './spaces/tables/catalog.table';
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

  getCredentials(): Credentials {
    const result = this.shipDB
      .prepare('SELECT * FROM credentials LIMIT 1;')
      .get();

    log.info('ship.db.ts:', 'getCredentials', result);

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
