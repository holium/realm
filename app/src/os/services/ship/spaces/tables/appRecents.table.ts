// import log from 'electron-log';
import Database from 'better-sqlite3-multiple-ciphers';

import AbstractDataAccess from '../../../abstract.db';

export interface AppRecentsRow {
  publisher: string;
  desk: string;
  type: 'desk' | 'publisher';
}

const tableName = 'app_recents';

export class AppRecentsTable extends AbstractDataAccess<AppRecentsRow, any> {
  constructor(preload: boolean, db?: Database) {
    super({
      preload: preload,
      db,
      name: 'AppRecentsDB',
      tableName,
    });
    if (preload) {
      return;
    }
  }

  protected mapRow(row: any): AppRecentsRow {
    return row;
  }

  public addRecentDesk(desk: string) {
    if (!this.db?.open) return;
    const insert = this.db.prepare(
      `REPLACE INTO ${tableName} (
        publisher,
        desk,
        type
      ) VALUES (
        @publisher,
        @desk,
        @type
      )`
    );
    insert.run({ publisher: '', desk, type: 'desk' });

    const deleteOldest = this.db.prepare(
      `DELETE FROM ${tableName} 
        WHERE id NOT IN (
          SELECT id FROM ${tableName} 
          WHERE type = 'desk' 
          ORDER BY id DESC 
          LIMIT 5
        ) AND type = 'desk'`
    );
    deleteOldest.run();
    return this.getRecentDesks();
  }

  public async getRecentDesks() {
    if (!this.db?.open) return [];
    const query = this.db.prepare(
      `SELECT desk FROM ${tableName} WHERE type = 'desk' ORDER BY id DESC LIMIT 5`
    );
    return query.all();
  }

  public addRecentPublisher(publisher: string) {
    if (!this.db?.open) return;
    const insert = this.db.prepare(
      `REPLACE INTO ${tableName} (
        publisher,
        desk,
        type
      ) VALUES (
        @publisher,
        @desk,
        @type
      )`
    );
    insert.run({ publisher, desk: '', type: 'publisher' });
    const deleteOldest = this.db.prepare(
      `DELETE FROM ${tableName} 
        WHERE id NOT IN (
          SELECT id FROM ${tableName} 
          WHERE type = 'publisher' 
          ORDER BY id DESC 
          LIMIT 5
        ) AND type = 'publisher'`
    );
    deleteOldest.run();
    return this.getRecentPublishers();
  }
  public async getRecentPublishers() {
    if (!this.db?.open) return [];
    const query = this.db.prepare(
      `SELECT publisher FROM ${tableName} WHERE type = 'publisher' ORDER BY id DESC LIMIT 5`
    );
    return query.all();
  }
}

export const appRecentsInitSql = `
  create table if not exists ${tableName} (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      publisher TEXT,
      desk TEXT,
      type TEXT NOT NULL
  );
  create unique index if not exists ${tableName}_uindex on ${tableName} (publisher, desk, type);
`;

export const appRecentsPreload = AppRecentsTable.preload(
  new AppRecentsTable(true)
);
