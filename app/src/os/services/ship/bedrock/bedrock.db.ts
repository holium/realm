import Database from 'better-sqlite3-multiple-ciphers';

import AbstractDbManager, { BUILTIN_TYPES } from './abstract';
import { CHAT_TABLES } from './bedrock.schema';
import {
  BaseRow,
  BedrockRow,
  CredsRow,
  deleteRowUpdate,
  GeneralRow,
  VoteRow,
} from './bedrock.types';

// take raw db record and turns it into BaseRow
function _encodeDbBase(row: any): BaseRow {
  return {
    id: row.id,
    path: row.path,
    type: row.type,
    creator: row.creator,
    created_at: row.created_at,
    updated_at: row.updated_at,
    received_at: row.received_at,
  };
}

// take raw db record and turns it into VoteRow
function _encodeDbVote(row: any): VoteRow {
  const base = _encodeDbBase(row);
  return {
    ...base,
    up: row.up === 1,
    parent_id: row.parent_id,
    parent_type: row.parent_type,
    parent_path: row.parent_path,
  } as VoteRow;
}

// take raw db record and turns it into CredsRow
function _encodeDbCreds(row: any): CredsRow {
  const base = _encodeDbBase(row);
  return {
    ...base,
    endpoint: row.endpoint,
    access_key_id: row.access_key_id,
    secret_access_key: row.secret_access_key,
    buckets: JSON.parse(row.buckets),
    current_bucket: row.current_bucket,
    region: row.region,
  } as CredsRow;
}

// take raw db record and turns it into GeneralRow
function _encodeDbGeneral(row: any): GeneralRow {
  const base = _encodeDbBase(row);
  return {
    ...base,
    data: JSON.parse(row.data),
  } as GeneralRow;
}

export class SqliteDbManager extends AbstractDbManager {
  protected db?: Database;
  public readonly open: boolean;

  constructor(params: any) {
    params.name = 'bedrockSqlite3';
    super(params);
    this.open = false;
    if (params.preload) return;
    this.db = params.db;
    this.open = !!this.db?.open;
  }

  createTableIfNotExists(row: BedrockRow) {
    const tbl: string = this.makeTableName(row.type);
    let sql = `
    create table if not exists ${tbl} (
      id           TEXT PRIMARY KEY,
      path         TEXT NOT NULL,
      type         TEXT NOT NULL,
      creator      TEXT NOT NULL,
      data         TEXT NOT NULL,
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL,
      received_at  INTEGER NOT NULL
    );
    `;

    if (row.type === BUILTIN_TYPES.CREDS) {
      sql = `
      create table if not exists ${tbl} (
        id           TEXT PRIMARY KEY,
        path         TEXT NOT NULL,
        type         TEXT NOT NULL,
        creator      TEXT NOT NULL,
        endpoint     TEXT NOT NULL,
        access_key_id     TEXT NOT NULL,
        secret_access_key TEXT NOT NULL,
        buckets      TEXT NOT NULL,
        current_bucket    TEXT NOT NULL,
        region       TEXT NOT NULL,
        created_at   INTEGER NOT NULL,
        updated_at   INTEGER NOT NULL,
        received_at  INTEGER NOT NULL
      );
      `;
    }
    if (row.type === BUILTIN_TYPES.VOTE) {
      sql = `
      create table if not exists ${tbl} (
        id           TEXT PRIMARY KEY,
        path         TEXT NOT NULL,
        type         TEXT NOT NULL,
        creator      TEXT NOT NULL,
        parent_id    TEXT NOT NULL,
        parent_type  TEXT NOT NULL,
        parent_path  TEXT NOT NULL,
        up           INTEGER NOT NULL,
        created_at   INTEGER NOT NULL,
        updated_at   INTEGER NOT NULL,
        received_at  INTEGER NOT NULL
      );
      `;
    }
    sql += `
      create index if not exists ${tbl}_path on ${tbl} (path);
      create index if not exists ${tbl}_path_id on ${tbl} (path, id);
      create index if not exists ${tbl}_creator on ${tbl} (creator);
      create index if not exists ${tbl}_received_at on ${tbl} (received_at);
      `;
    return !!this.db?.exec(sql);
  }

  insertRows(rows: BedrockRow[]) {
    if (!this.db?.open) return false;
    const creds = rows.filter((r) => r.type === BUILTIN_TYPES.CREDS);
    rows = rows.filter((r) => r.type !== BUILTIN_TYPES.CREDS);
    if (creds.length) {
      const insert = this.db.prepare(
        `REPLACE INTO ${this.makeTableName(BUILTIN_TYPES.CREDS)} (
          id,
          path,
          type,
          creator,
          endpoint,
          access_key_id,
          secret_access_key,
          buckets,
          current_bucket,
          region,
          created_at,
          updated_at,
          received_at
        ) VALUES (
          @id,
          @path,
          @type,
          @creator,
          @endpoint,
          @access_key_id,
          @secret_access_key,
          @buckets,
          @current_bucket,
          @region,
          @created_at,
          @updated_at,
          @received_at
        )`
      );
      const insertMany = this.db.transaction((rows: CredsRow[]) => {
        for (const row of rows) {
          console.log('creds', row);
          insert.run({
            ...row,
            buckets: JSON.stringify(row.buckets),
          });
        }
      });
      insertMany(creds);
    }
    const votes = rows.filter((r) => r.type === BUILTIN_TYPES.VOTE);
    rows = rows.filter((r) => r.type !== BUILTIN_TYPES.VOTE);
    if (votes.length) {
      const insert = this.db.prepare(
        `REPLACE INTO ${this.makeTableName(BUILTIN_TYPES.VOTE)} (
          id,
          path,
          type,
          creator,
          parent_id,
          parent_type,
          parent_path,
          up,
          created_at,
          updated_at,
          received_at
        ) VALUES (
          @id,
          @path,
          @type,
          @creator,
          @parent_id,
          @parent_type,
          @parent_path,
          @up,
          @created_at,
          @updated_at,
          @received_at
        )`
      );
      const insertMany = this.db.transaction((rows: VoteRow[]) => {
        for (const row of rows) {
          insert.run({
            ...row,
            up: row.up ? 1 : 0, //sqlite does boolean as integer
          });
        }
      });
      insertMany(votes);
    }
    if (rows.length) {
      for (const row of rows as GeneralRow[]) {
        this.db
          .prepare(
            `REPLACE INTO ${this.makeTableName(row.type)} (
            id,
            path,
            type,
            creator,
            data,
            created_at,
            updated_at,
            received_at
          ) VALUES (
            @id,
            @path,
            @type,
            @creator,
            @data,
            @created_at,
            @updated_at,
            @received_at
          )`
          )
          .run({
            ...row,
            data: JSON.stringify(row.data),
          });
      }
    }
    return true;
  }

  updateRows(rows: BedrockRow[]) {
    this.insertRows(rows); //Replace into will update
    return true;
  }

  deleteRows(dels: deleteRowUpdate[]) {
    if (!this.db?.open) return false;
    for (const del of dels) {
      const tbl: string = this.makeTableName(del.type);
      try {
        const deletePath = this.db.prepare(
          `DELETE FROM ${tbl} WHERE id = ? AND path = ?`
        );
        deletePath.run(del.id, del.path);
      } catch (err) {
        if ((err as any).message.match(/^no such table/)) {
          console.error(err);
        } else {
          throw err;
        }
      }
    }
    return true;
  }

  // ----------------------------------------------
  // ----------------- DB queries -----------------
  // ----------------------------------------------
  selectType(type: string): BedrockRow[] {
    if (!this.db?.open) return [];
    const tbl: string = this.makeTableName(type);
    const results = this.db.prepare(`SELECT * FROM ${tbl}`).all();
    return results.map(this._encodeDbRow);
  }

  selectById(type: string, id: string): BedrockRow[] {
    if (!this.db?.open) return [];
    const tbl: string = this.makeTableName(type);
    const results = this.db
      .prepare(`SELECT * FROM ${tbl} WHERE id = ?`)
      .all(id);
    return results.map(this._encodeDbRow);
  }

  selectByPath(type: string, path: string): BedrockRow[] {
    if (!this.db?.open) return [];
    const tbl: string = this.makeTableName(type);
    const results = this.db
      .prepare(`SELECT * FROM ${tbl} WHERE path = ?`)
      .all(path);
    return results.map(this._encodeDbRow);
  }

  // take raw db record and turns it into BaseRow
  private _encodeDbRow(row: any): BedrockRow {
    if (row.type === BUILTIN_TYPES.VOTE) {
      return _encodeDbVote(row);
    } else if (row.type === BUILTIN_TYPES.CREDS) {
      return _encodeDbCreds(row);
    } else {
      return _encodeDbGeneral(row);
    }
  }
  getLastTimestamp(
    table:
      | CHAT_TABLES.PATHS
      | CHAT_TABLES.MESSAGES
      | CHAT_TABLES.PEERS
      | CHAT_TABLES.DELETE_LOGS
      | 'notifications',
    path?: string,
    patp?: string
  ): number {
    if (!this.db?.open) return 0;
    const where =
      path && patp ? ` WHERE path = '${path}' and sender != '${patp}'` : '';
    const column =
      table === CHAT_TABLES.DELETE_LOGS ? 'timestamp' : 'received_at';

    const query = this.db.prepare(`
      SELECT max(${column}) as lastTimestamp
      FROM ${table}${where};
    `);
    const result: any = query.all();
    // subtract 1 to ensure re-fetching that same timestamp so we don't have timing issues
    return Math.max(result[0]?.lastTimestamp - 1, 0) || 0;
  }

  selectCountForPath(type: string, path: string) {
    if (!this.db?.open) return;
    const tbl: string = this.makeTableName(type);
    const query = this.db.prepare(`
      SELECT count(*)
      FROM ${tbl}
      WHERE path = '${path}'`);
    const result = query.all();
    return result[0]['count(*)'];
  }
}

export const bedrockDBPreload = SqliteDbManager.preload(
  new SqliteDbManager({ preload: true, name: 'bedrockSqlite3' })
);
