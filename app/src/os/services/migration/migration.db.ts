import { app } from 'electron';
import Database from 'better-sqlite3-multiple-ciphers';

import { Migration, MigrationService } from './migration.service';
import {
  SchemaVersions,
  schemaVersionsInitSql,
  schemaVersionsWipeSql,
} from './schemaVersions.table';

const migrations: Migration[] = [
  {
    version: 1,
    up: `${schemaVersionsInitSql}`,
    down: `${schemaVersionsWipeSql}`,
  },
];

export class MigrationDB {
  private readonly migrationDB: Database;
  tables: {
    schemaVersions: SchemaVersions;
  };

  constructor() {
    this.migrationDB = MigrationService.getInstance().setupAndMigrate(
      'migration',
      migrations,
      1
    );
    this.tables = {
      schemaVersions: new SchemaVersions(this.migrationDB),
    };

    app.on('quit', () => {
      this.disconnect();
    });
  }

  disconnect() {
    this.migrationDB.close();
  }
}
