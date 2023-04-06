import { Database } from 'better-sqlite3';
import AbstractDataAccess from '../../../abstract.db';
import { cleanNounColor } from '../../../../lib/color';
// import { ThemeType } from 'renderer/stores/models/theme.model';

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
  // createdAt: number;
  // updatedAt: number;
}

export class SpacesDB extends AbstractDataAccess<Space> {
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
      // updatedAt: row.updatedAt,
      // createdAt: row.createdAt,
    };
  }

  public insertAll(spaces: Space[]) {
    if (!this.db) throw new Error('No db connection');
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
    const insertMany = this.db.transaction((spaces) => {
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

  public findOne(path: string): Space | null {
    const query = `SELECT * FROM ${this.tableName} WHERE path = ?`;
    const stmt = this.prepare(query);
    const row = stmt.get(path);
    return row ? this.mapRow(row) : null;
  }

  public create(values: Partial<Space>): Space {
    const columns = Object.keys(values).join(', ');
    const placeholders = Object.keys(values)
      .map(() => '?')
      .join(', ');
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const stmt = this.prepare(query);

    stmt.run(Object.values(values));
    if (!values.path) throw new Error('Failed to create new record');
    const created = this.findOne(values.path);
    if (!created) throw new Error('Failed to create new record');
    return created;
  }

  public update(path: string, values: Partial<Space>): Space {
    const setClause = Object.keys(values)
      .map((key) => `${key} = ?`)
      .join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE path = ?`;
    const stmt = this.prepare(query);

    stmt.run([...Object.values(values), path]);
    const updated = this.findOne(path);
    if (!updated) throw new Error('Failed to update record');
    return updated;
  }

  public delete(path: string): void {
    const query = `DELETE FROM ${this.tableName} WHERE path = ?`;
    const stmt = this.prepare(query);

    const result = stmt.run(path);
    if (result.changes !== 1) throw new Error('Failed to delete record');
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
    theme           text
  );
  create unique index if not exists spaces_path_uindex on spaces (path);
`;

export const spacesDBPreload = SpacesDB.preload(new SpacesDB(true));
