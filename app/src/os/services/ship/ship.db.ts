import Database from 'better-sqlite3-multiple-ciphers';

import { Migration, MigrationService } from '../migration/migration.service';
import { CHAT_TABLES, chatInitSql, chatWipeSql } from './chat/chat.schema';
import { friendsInitSql, friendsWipeSql } from './friends.service';
import { lexiconInitSql, lexiconWipeSql } from './lexicon.tables';
import {
  notifInitSql,
  notifWipeSql,
} from './notifications/notifications.table';
import { settingsInitSql, settingsWipeSql } from './settings.service';
import { Credentials } from './ship.types.ts';
import {
  spacesTablesInitSql,
  spacesTablesWipeSql,
} from './spaces/spaces.service';
import {
  appPublishersInitSql,
  appPublishersWipeSql,
} from './spaces/tables/appPublishers.table';
import {
  appRecentsInitSql,
  appRecentsWipeSql,
} from './spaces/tables/appRecents.table';
import {
  bazaarTablesInitSql,
  bazaarTablesWipeSql,
} from './spaces/tables/catalog.table';
import { walletInitSql, walletWipeSql } from './wallet/wallet.db';

const initSql = `
${bazaarTablesInitSql}
${lexiconInitSql}
${chatInitSql}
${notifInitSql}
${friendsInitSql}
${spacesTablesInitSql}
${walletInitSql}
${appPublishersInitSql}
${appRecentsInitSql}
${settingsInitSql}
create table if not exists credentials (
  url       TEXT PRIMARY KEY NOT NULL,
  code      TEXT NOT NULL,
  cookie    TEXT NOT NULL,
  wallet    TEXT
);
`;

const wipeSql = `
  ${bazaarTablesWipeSql}
  ${lexiconWipeSql}
  ${chatWipeSql}
  ${notifWipeSql}
  ${friendsWipeSql}
  ${spacesTablesWipeSql}
  ${walletWipeSql}
  ${appPublishersWipeSql}
  ${appRecentsWipeSql}
  ${settingsWipeSql}
  drop table if exists credentials;
`;

const migrations: Migration[] = [
  {
    version: 1,
    up: `${initSql}`,
    down: `${wipeSql}`,
  },
  {
    version: 2,
    up: `
      alter table ${CHAT_TABLES.MESSAGES} add column received_at INTEGER NOT NULL DEFAULT 0;
      alter table ${CHAT_TABLES.PEERS} add column received_at INTEGER NOT NULL DEFAULT 0;
      alter table ${CHAT_TABLES.PATHS} add column received_at INTEGER NOT NULL DEFAULT 0;

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
    `,
    down: `
      alter table ${CHAT_TABLES.MESSAGES} drop column received_at;
      alter table ${CHAT_TABLES.PEERS} drop column received_at;
      alter table ${CHAT_TABLES.PATHS} drop column received_at;

      create table if not exists credentials_temp (
        url       TEXT PRIMARY KEY NOT NULL,
        code      TEXT NOT NULL,
        cookie    TEXT NOT NULL,
        wallet    TEXT
      );
      INSERT INTO credentials_temp(url, code, cookie, wallet)
      SELECT url, code, COALESCE(cookie, ''), wallet
      FROM credentials;
      DROP TABLE credentials;
      ALTER TABLE credentials_temp RENAME TO credentials;
    `,
  },
  {
    version: 3,
    up: `
      ALTER TABLE settings ADD COLUMN standaloneChatSpaceWallpaperEnabled number DEFAULT 1;
      ALTER TABLE settings ADD COLUMN standaloneChatPersonalWallpaperEnabled number DEFAULT 0;
    `,
    down: `
      ALTER TABLE settings DROP COLUMN standaloneChatSpaceWallpaperEnabled;
      ALTER TABLE settings DROP COLUMN standaloneChatPersonalWallpaperEnabled;
    `,
  },
];

export class ShipDB {
  private shipDB: Database;
  private patp: string;

  // private readonly dontEncryptDb: boolean =
  //   process.env.DONT_ENCRYPT_DB === 'true';

  constructor(
    patp: string,
    _password: string,
    _clientSideEncryptionKey: string
  ) {
    this.patp = patp;
    this.shipDB = MigrationService.getInstance().setupAndMigrate(
      this.patp,
      migrations,
      3
    );
    // TODO: re-enable encryption
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
