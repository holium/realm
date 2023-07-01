import Database from 'better-sqlite3-multiple-ciphers';

import AbstractDataAccess from '../abstract.db';
import { ServiceOptions } from '../abstract.service';

export type Setting = {
  identity: string;
  isolationModeEnabled: number;
  realmCursorEnabled: number;
  profileColorForCursorEnabled: number;
};

export class SettingsService extends AbstractDataAccess<Setting, any> {
  constructor(options: ServiceOptions, db?: Database) {
    super({
      preload: options.preload,
      db,
      name: 'settingsService',
      tableName: 'settings',
    });
  }

  protected mapRow(row: any): Setting {
    return {
      identity: row.identity,
      isolationModeEnabled: row.isolationModeEnabled,
      realmCursorEnabled: row.realmCursorEnabled,
      profileColorForCursorEnabled: row.profileColorForCursorEnabled,
    };
  }

  public get(identity: string): Setting | undefined {
    if (!this.db?.open) return;

    const query = this.db.prepare(
      `SELECT * FROM settings WHERE identity = @identity`
    );

    const result = query.get({ identity });
    if (!result) return;

    return this.mapRow(result);
  }

  set(setting: Setting) {
    if (!this.db?.open) return;
    const replace = this.db.prepare(
      `REPLACE INTO settings (
        identity,
        isolationModeEnabled,
        realmCursorEnabled,
        profileColorForCursorEnabled
      ) VALUES (
        @identity,
        @isolationModeEnabled,
        @realmCursorEnabled,
        @profileColorForCursorEnabled
      )`
    );
    replace.run(setting);
  }

  removeSetting(identity: string) {
    if (!this.db?.open) return;
    const insert = this.db.prepare(
      `DELETE FROM settings WHERE identity = @identity`
    );
    insert.run({ identity });
  }
}

export const settingsInitSql = `
  create table if not exists settings (
    identity text primary key,
    isolationModeEnabled number,
    realmCursorEnabled number,
    profileColorForCursorEnabled number
  );
`;

// standaloneChatWallpaperEnabled number,
// roomsAudioInputSource text,
// roomsAudioOutputSource text

export const settingsWipeSql = `drop table if exists settings;`;

export const settingsPreload = SettingsService.preload(
  new SettingsService({ preload: true })
);
