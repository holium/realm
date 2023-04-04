import { Database } from 'better-sqlite3';
import log from 'electron-log';
import AbstractDataAccess from '../../../abstract.db';

export interface Bazaar {
  space: string;
  patp: string;
  roles: string;
  alias: string;
  status: string;
  // createdAt: number;
  // updatedAt: number;
}

export class BazaarDB extends AbstractDataAccess<Bazaar> {
  constructor(preload: boolean, db?: Database) {
    super({
      preload: preload,
      db,
      name: 'membersDB',
      tableName: 'spaces_members',
    });
    if (preload) {
      return;
    }
  }

  protected mapRow(row: any): Bazaar {
    return {
      space: row.space,
      patp: row.patp,
      roles: JSON.parse(row.roles),
      alias: row.alias,
      status: row.status,
      // updatedAt: row.updatedAt,
      // createdAt: row.createdAt,
    };
  }

  public insertAll(spacesMembers: { [key: string]: Bazaar[] }) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO spaces_members (
        space,
        patp,
        roles,
        alias,
        status
      ) VALUES (
        @space,
        @patp,
        @roles,
        @alias,
        @status
      )`
    );
    const insertMany = this.db.transaction((spacesMembers) => {
      Object.entries<any>(spacesMembers).forEach(([space, memberList]) => {
        Object.entries<any>(memberList).forEach(([patp, member]) => {
          insert.run({
            space,
            patp: patp,
            roles: JSON.stringify(member.roles),
            alias: member.alias || '',
            status: member.status,
          });
        });
      });
    });
    insertMany(spacesMembers);
    this.sendUpdate({
      type: 'insert',
      payload: this.find(),
    });
  }

  public findOne(path: string): Bazaar | null {
    const query = `SELECT * FROM ${this.tableName} WHERE path = ?`;
    const stmt = this.prepare(query);
    const row = stmt.get(path);
    return row ? this.mapRow(row) : null;
  }

  public create(values: Partial<Bazaar>): Bazaar {
    const columns = Object.keys(values).join(', ');
    const placeholders = Object.keys(values)
      .map(() => '?')
      .join(', ');
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const stmt = this.prepare(query);

    stmt.run(Object.values(values));
    if (!values.space) throw new Error('Failed to create new record');
    const created = this.findOne(values.space);
    if (!created) throw new Error('Failed to create new record');
    return created;
  }

  public update(path: string, values: Partial<Bazaar>): Bazaar {
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

export const bazaarInitSql = `
  create table if not exists spaces_members (
      space     text not null,
      patp      text not null,
      roles     text not null,
      alias     text,
      status    text not null
  );
  create unique index if not exists spaces_members_patp_uindex on spaces_members (space, patp);
`;

export const spacesMembersDBPreload = BazaarDB.preload(new BazaarDB(true));
