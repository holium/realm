import { app } from 'electron';
import log from 'electron-log';
import Database from 'better-sqlite3-multiple-ciphers';
import path from 'path';

import AbstractService, { ServiceOptions } from '../abstract.service';
import { MigrationDB } from './migration.db';

export interface Migration {
  version: number;
  up: string;
  down: string;
}

export class MigrationService extends AbstractService {
  private static instance: MigrationService;
  private readonly migrationDB?: MigrationDB;
  constructor(options?: ServiceOptions) {
    super('migrationService', options);
    if (options?.preload) {
      return;
    }
    this.migrationDB = new MigrationDB();
  }

  public static getInstance(options?: ServiceOptions): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService(options);
    }
    return MigrationService.instance;
  }

  public getSchemaVersion(table: string): number {
    if (!this.migrationDB) return 0;
    const record = this.migrationDB.tables.schemaVersions.findOne(table);
    if (!record) return 0;
    return record.version;
  }

  public setSchemaVersion(table: string, version: number) {
    if (!this.migrationDB) return;
    return this.migrationDB.tables.schemaVersions.upsert(table, { version });
  }

  public setupAndMigrate(
    table: string,
    migrations: Migration[],
    targetVersion: number,
    password?: string
  ): Database {
    const dbPath = path.join(app.getPath('userData'), table + '.sqlite');
    const db = new Database(dbPath, { password });

    // default actions
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    const currentVersion = this.getSchemaVersion(table);

    if (targetVersion > currentVersion) {
      for (const migration of migrations) {
        if (
          migration.version > currentVersion &&
          migration.version <= targetVersion
        ) {
          const upStatement = db.prepare(migration.up);
          upStatement.run();
          this.setSchemaVersion(table, migration.version);
          log.info(
            'migration.service.ts:',
            `Up migration to version ${migration.version} for table ${table} applied.`
          );
        }
      }
    } else if (targetVersion < currentVersion) {
      // Perform down migrations in reverse order
      for (const migration of migrations.slice().reverse()) {
        if (
          migration.version <= currentVersion &&
          migration.version > targetVersion
        ) {
          const downStatement = db.prepare(migration.down);
          downStatement.run();
          db.prepare('UPDATE schema_version SET version = ?').run(
            migration.version - 1
          );
          log.info(
            'migration.service.ts:',
            `Down migration to version ${
              migration.version - 1
            } for table ${table} applied.`
          );
        }
      }
    }
    return db;
  }
  //   public migrate(table: string, version: number);
}
