import Database from 'better-sqlite3-multiple-ciphers';

import AbstractDataAccess from '../abstract.db';

export interface SchemaVersion {
  table: string;
  version: number;
}

export class SchemaVersions extends AbstractDataAccess<any> {
  constructor(db: Database) {
    super({
      preload: false,
      db,
      name: 'schemaVersions',
      tableName: 'schema_versions',
    });
  }

  protected mapRow(row: any): SchemaVersion {
    return {
      table: row.table,
      version: row.version,
    };
  }
}

export const schemaVersionsInitSql = `
    create table if not exists schema_versions (
    table           TEXT NOT NULL PRIMARY KEY,
    version         INTEGER NOT NULL,
    );
`;

export const schemaVersionsWipeSql = `drop table if exists schema_versions;`;
