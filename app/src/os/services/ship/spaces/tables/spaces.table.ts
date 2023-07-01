// import log from 'electron-log';
import Database from 'better-sqlite3-multiple-ciphers';

import { cleanNounColor } from '../../../../lib/color';
import AbstractDataAccess from '../../../abstract.db';

export interface Space {
  path: string;
  name: string;
  description: string;
  color: string;
  type: string;
  archetype: string;
  picture: string;
  access: string;
  theme: any;
  current: boolean;
  // createdAt: number;
  // updatedAt: number;
}

export class SpacesDB extends AbstractDataAccess<Space, any> {
  constructor(preload: boolean, db?: Database) {
    super({ preload: preload, db, name: 'spacesDB', tableName: 'spaces' });
    if (preload) {
      return;
    }
  }

  protected mapRow(row: any): Space {
    return {
      path: row.path,
      name: row.name,
      description: row.description,
      color: row.color ? cleanNounColor(row.color) : '#000000',
      type: row.type,
      archetype: row.archetype,
      picture: row.picture,
      access: row.access,
      theme: JSON.parse(row.theme),
      current: row.current === 1,
      // updatedAt: row.updatedAt,
      // createdAt: row.createdAt,
    };
  }

  public insertAll(spaces: { [path: string]: Space }) {
    if (!this.db?.open) return;

    const insert = this.db.prepare(
      `REPLACE INTO spaces (
        path,
        name,
        description,
        color,
        type,
        archetype,
        picture,
        access,
        theme
      ) VALUES (
        @path,
        @name,
        @description,
        @color,
        @type,
        @archetype,
        @picture,
        @access,
        @theme
      )`
    );
    const insertMany = this.db.transaction((spaces: any) => {
      Object.entries<any>(spaces).forEach(([path, space]) => {
        insert.run({
          path,
          name: space.name,
          description: space.description,
          color: space.color,
          type: space.type,
          archetype: space.archetype || 'community',
          picture: space.picture,
          access: space.access,
          theme: JSON.stringify(space.theme),
        });
      });
    });
    insertMany(spaces);
    this.sendUpdate({
      type: 'insert',
      payload: this.find(),
    });
  }

  public getCurrent(): Space | null {
    const query = `SELECT * FROM ${this.tableName} WHERE current = 1 LIMIT 1`;
    const stmt = this.prepare(query);
    const row = stmt.get();
    return row ? this.mapRow(row) : null;
  }

  public setCurrent(path: string) {
    // update all to 0 and then set the one to 1 in one transaction
    const query = `
    UPDATE spaces
      SET current = (
        CASE
          WHEN path = ? THEN 1
          ELSE 0
        END
      )`;

    const stmt = this.prepare(query);
    stmt.run(path);
  }

  public update(path: string, values: Partial<Space>): Space {
    if (values.theme) values.theme = JSON.stringify(values.theme);
    return super.update(path, values);
  }
}

export const spacesInitSql = `
  create table if not exists spaces (
    current         integer default 0,
    path            text primary key,
    name            text not null,
    description     text,
    color           text,
    type            text not null,
    archetype       text,
    picture         text,
    access          text,
    theme           text,
    updatedAt       integer
  );
  create unique index if not exists spaces_path_uindex on spaces (path);
`;

export const spacesWipeSql = `drop table if exists spaces;`;

export const spacesDBPreload = SpacesDB.preload(new SpacesDB(true));
