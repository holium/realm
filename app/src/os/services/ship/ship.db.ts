import { app } from 'electron';
import log from 'electron-log';
import Database from 'better-sqlite3-multiple-ciphers';
import path from 'path';

import { CHAT_TABLES, chatInitSql } from './chat/chat.schema';
import { friendsInitSql } from './friends.service';
import { lexiconInitSql } from './lexicon.tables';
import { notifInitSql } from './notifications/notifications.table';
import { settingsInitSql } from './settings.service';
import { Credentials } from './ship.types.ts';
import { spacesTablesInitSql } from './spaces/spaces.service';
import { appPublishersInitSql } from './spaces/tables/appPublishers.table';
import { appRecentsInitSql } from './spaces/tables/appRecents.table';
import { bazaarTablesInitSql } from './spaces/tables/catalog.table';
import { walletInitSql } from './wallet/wallet.db';

export class ShipDB {
  private shipDB: Database;
  private patp: string;

  private readonly dbPath: string;
  // private readonly dontEncryptDb: boolean =
  //   process.env.DONT_ENCRYPT_DB === 'true';

  constructor(
    patp: string,
    _password: string,
    _clientSideEncryptionKey: string
  ) {
    this.patp = patp;
    this.dbPath = path.join(app.getPath('userData'), `${patp}.sqlite`);

    // Create the database if it doesn't exist

    this.shipDB = new Database(this.dbPath);
    this.shipDB.exec(initSql);

    // } else {
    //   log.info('ship.db.ts:', 'Encrypting ship db');
    //   const hashGenerator = crypto.createHmac(
    //     'sha256',
    //     clientSideEncryptionKey
    //   );
    //   const passwordHash = hashGenerator.update(password).digest('hex');

    //   this.shipDB = new Database(this.dbPath, {
    //     key: passwordHash,
    //   });
    //   this.shipDB.exec(initSql);
    // }

    // update db schemas if we need to
    this.addColumnIfNotExists(
      CHAT_TABLES.MESSAGES,
      'received_at',
      'INTEGER NOT NULL DEFAULT 0'
    );
    this.addColumnIfNotExists(
      CHAT_TABLES.PEERS,
      'received_at',
      'INTEGER NOT NULL DEFAULT 0'
    );
    this.addColumnIfNotExists(
      CHAT_TABLES.PATHS,
      'received_at',
      'INTEGER NOT NULL DEFAULT 0'
    );

    // e.g. make cookie nullable in credentials table
    log.info('ship.db.ts:', 'Running upgrade script');
    this.shipDB.exec(upgradeScript);
  }

  private addColumnIfNotExists(table: string, column: string, type: string) {
    const queryResult = this.shipDB
      .prepare(
        `select count(*) as found from pragma_table_info('${table}') where name='${column}'`
      )
      .all();
    const found: boolean = queryResult?.[0].found > 0;
    if (!found) {
      this.shipDB.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`);
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

    // console.info('ship.db.ts:', 'getCredentials', result);

    return { ...result, ship: this.patp };
  }

  setCredentials(url: string, code: string, cookie: string | null) {
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
${appPublishersInitSql}
${appRecentsInitSql}
${settingsInitSql}
${lexiconInitSql}
create table if not exists credentials (
  url       TEXT PRIMARY KEY NOT NULL,
  code      TEXT NOT NULL,
  cookie    TEXT NOT NULL,
  wallet    TEXT
);
`;

const upgradeScript = `
BEGIN TRANSACTION;
create table if not exists credentials_temp (
  url       TEXT PRIMARY KEY NOT NULL,
  code      TEXT NOT NULL,
  cookie    TEXT,
  wallet    TEXT
);
INSERT INTO credentials_temp(url, code, cookie, wallet)
SELECT url, code, cookie, wallet
FROM credentials;
DROP TABLE credentials;
ALTER TABLE credentials_temp RENAME TO credentials;
COMMIT TRANSACTION;
`;
