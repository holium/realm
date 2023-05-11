// import log from 'electron-log';
import Database from 'better-sqlite3-multiple-ciphers';

import AbstractDataAccess from '../../../abstract.db';
import { APIConnection } from '../../../api';

export interface AppPublisherRow {
  publisher: string;
  source: string;
  desk: string;
  status: 'requesting' | 'loaded' | 'failed';
  requestedAt: number;
  loadedAt: number;
}

const tableName = 'app_publishers';

export class AppPublishersTable extends AbstractDataAccess<
  AppPublisherRow,
  any
> {
  constructor(preload: boolean, db?: Database) {
    super({
      preload: preload,
      db,
      name: 'AppPublishersDB',
      tableName,
    });
    if (preload) {
      return;
    }
  }

  protected mapRow(row: any): AppPublisherRow {
    return {
      ...row,
      loadedAt: row.loaded_at,
      requestedAt: row.requested_at,
    };
  }

  public getAppPublishers(): { [path: string]: AppPublisherRow } {
    if (!this.db?.open) return {};
    const query = this.db.prepare(
      `WITH sources AS (SELECT
          publisher,
          max(status) status,
          max(requested_at) requestedAt,
          max(loaded_at) loadedAt,
          json_group_array(
              json_object(
                'source', source,
                'desk', desk
              )
          ) as sources_list
        FROM ${tableName}
        GROUP BY publisher)
        SELECT json_group_object(
            sources.publisher,
            json_object(
                'status', sources.status, 
                'apps', json(sources.sources_list),
                'requestedAt', sources.requestedAt,
                'loadedAt', sources.loadedAt
            )
      ) publishers FROM sources`
    );
    const publishers: any = query.all();
    if (!publishers.length) return {};
    return JSON.parse(publishers[0].publishers);
  }

  public async addAlly(publisher: string) {
    if (!this.db?.open) return;
    APIConnection.getInstance().conduit.poke({
      app: 'treaty',
      mark: 'ally-update-0',
      json: {
        add: publisher,
      },
    });
    const insert = this.db.prepare(
      `REPLACE INTO ${tableName} (
        publisher,
        source,
        desk,
        status,
        requested_at,
      ) VALUES (
        @publisher,
        @source,
        @desk,
        @status
        @requestedAt,
      )`
    );
    insert.run({
      publisher,
      source: '',
      desk: '',
      status: 'requesting',
      requestedAt: Date.now(),
    });
  }

  public async removeAlly(publisher: string) {
    if (!this.db?.open) return;
    APIConnection.getInstance().conduit.poke({
      app: 'treaty',
      mark: 'ally-update-0',
      json: {
        del: publisher,
      },
    });
    const remove = this.db.prepare(
      `DELETE FROM ${tableName} WHERE publisher = @publisher`
    );
    remove.run({ publisher });
  }

  public async getPublisherApps(publisher: string) {
    if (!this.db?.open) return [];
    const query = this.db.prepare(
      `WITH sources AS (SELECT
          publisher,
          max(status) status,
          max(requested_at) requestedAt,
          max(loaded_at) loadedAt,
          json_group_array(
              json_object(
                'source', source,
                'desk', desk
              )
          ) as sources_list
        FROM ${tableName}
        WHERE publisher = @publisher)
        SELECT json_object(
            sources.publisher,
            json_object(
                'status', sources.status, 
                'apps', json(sources.sources_list),
                'requestedAt', sources.requestedAt,
                'loadedAt', sources.loadedAt
            )
      ) publisher FROM sources`
    );
    const result = query.all({ publisher });
    if (!result.length) {
      return {
        publisher,
        status: 'requesting',
        apps: [],
        loadedAt: null,
        requestedAt: null,
      };
    }
    return JSON.parse(result[0].publisher);
  }

  public insertAll(allies: { [publisher: string]: string[] }) {
    if (!this.db?.open) return;
    const insert = this.db.prepare(
      `REPLACE INTO ${tableName} (
        publisher,
        source,
        desk,
        status,
        requested_at,
        loaded_at
      ) VALUES (
        @publisher,
        @source,
        @desk,
        @status,
        @requested_at,
        @loaded_at
      )`
    );

    const insertMany = this.db.transaction((ally: any) => {
      Object.entries<string[]>(ally).forEach(([publisher, apps]) => {
        apps.forEach((entry) => {
          const source = entry.split('/')[0];
          const desk = entry.split('/')[1];
          const existing = this.find(
            `publisher = '${publisher}' AND source = '${source}' AND desk = '${desk}'`
          );
          let requestedAt = new Date().getTime();
          let loadedAt = new Date().getTime();
          if (existing[0]) {
            loadedAt = existing[0].loadedAt;
            requestedAt = existing[0].requestedAt;
          }

          insert.run({
            publisher,
            source,
            desk,
            status: 'loaded',
            requested_at: requestedAt,
            loaded_at: loadedAt,
          });
        });
        if (apps.length === 0) {
          const existing = this.find(`publisher = '${publisher}'`);
          let requestedAt = new Date().getTime();
          if (existing[0]) {
            requestedAt = existing[0].requestedAt;
          }

          insert.run({
            publisher,
            source: '',
            desk: '',
            status: 'requesting',
            loaded_at: null,
            requested_at: requestedAt,
          });
        }
      });
    });
    insertMany(allies);
    return this.getAppPublishers();
  }
}

export const appPublishersInitSql = `
  create table if not exists ${tableName} (
      publisher TEXT NOT NULL,
      source TEXT,
      desk TEXT,
      status TEXT,
      requested_at INTEGER,
      loaded_at INTEGER,
      primary key (publisher, source, desk)
  );
  create unique index if not exists ${tableName}_uindex on ${tableName} (publisher, source, desk);
`;

export const appPublishersDBPreload = AppPublishersTable.preload(
  new AppPublishersTable(true)
);
