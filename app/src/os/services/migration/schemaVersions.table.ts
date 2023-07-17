import Database from 'better-sqlite3-multiple-ciphers';

import AbstractDataAccess from '../abstract.db';

export interface SchemaVersion {
  tableName: string;
  version: number;
}

export class SchemaVersions extends AbstractDataAccess<any> {
  constructor(db: Database) {
    super({
      preload: false,
      db,
      name: 'schemaVersions',
      tableName: 'schema_versions',
      pKey: 'table_name',
    });
  }

  protected mapRow(row: any): SchemaVersion {
    return {
      tableName: row.table_name,
      version: row.version,
    };
  }
}

export const schemaVersionsInitSql = `
create table if not exists schema_versions (
  table_name      TEXT PRIMARY KEY NOT NULL,
  version         INTEGER NOT NULL DEFAULT 0
);
`;

export const schemaVersionsWipeSql = `drop table if exists schema_versions;`;
