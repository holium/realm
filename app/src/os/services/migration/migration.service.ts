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
    this.migrationDB = new MigrationDB(this);
  }

  public static getInstance(options?: ServiceOptions): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService(options);
    }
    return MigrationService.instance;
  }

  public getSchemaVersion(tableName: string): number {
    if (!this.migrationDB) return 0;
    const record = this.migrationDB.tables.schemaVersions.findOne(tableName);
    if (!record) {
      this.setSchemaVersion(tableName, 0);
      return 0;
    }
    return record.version;
  }

  public setSchemaVersion(tableName: string, version: number) {
    if (!this.migrationDB) return;
    return this.migrationDB.tables.schemaVersions.upsert(tableName, {
      table_name: tableName,
      version,
    });
  }

  // run migrations as a transaction based on the current table version
  public setupAndMigrate(
    tableName: string,
    migrations: Migration[],
    targetVersion: number,
    password?: string
  ): Database {
    const dbPath = path.join(app.getPath('userData'), tableName + '.sqlite');
    const db = new Database(dbPath, { password });

    // default actions
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    const currentVersion = this.getSchemaVersion(tableName);

    if (targetVersion > currentVersion) {
      for (const migration of migrations) {
        if (
          migration.version > currentVersion &&
          migration.version <= targetVersion
        ) {
          // Run all statements in a transaction
          // These have to be broken into separate statements based on semicolon.
          const statements = migration.up
            .split(';')
            .filter((s) => s.trim() !== '');
          const transact = db.transaction((statements: string[]) => {
            for (const statement of statements) {
              log.info(statement);
              db.prepare(statement).run();
            }
            this.setSchemaVersion(tableName, migration.version);
          });
          try {
            transact(statements);
            log.info(
              'migration.service.ts:',
              `Up migration to version ${migration.version} for database '${tableName}' applied.`
            );
          } catch (error) {
            log.error(
              'migration.service.ts:',
              `Up migration to version ${migration.version} for database '${tableName}' failed.`
            );
            throw error;
          }
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
          this.setSchemaVersion(tableName, migration.version - 1);
          log.info(
            'migration.service.ts:',
            `Down migration to version ${
              migration.version - 1
            } for table '${tableName}' applied.`
          );
        }
      }
    }
    return db;
  }
  //   public migrate(table: string, version: number);
}
// Generate preload
export const migrationPreload = MigrationService.preload(
  new MigrationService({ preload: true })
);
