import Database from 'better-sqlite3-multiple-ciphers';

import AbstractDataAccess from '../../../abstract.db';

export interface Member {
  space: string;
  patp: string;
  roles: string;
  alias: string;
  status: string;
  // createdAt: number;
  // updatedAt: number;
}

export class MembersDB extends AbstractDataAccess<Member, any> {
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

  protected mapRow(row: any): Member {
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

  public insertAll(spacesMembers: { [key: string]: Member[] }) {
    if (!this.db?.open) return;
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
    const insertMany = this.db.transaction((spacesMembers: any) => {
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

  public createMember(values: Partial<Member>): Member {
    if (values.roles) values.roles = JSON.stringify(values.roles);
    const columns = Object.keys(values).join(', ');
    const placeholders = Object.keys(values)
      .map(() => '?')
      .join(', ');
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const stmt = this.prepare(query);
    stmt.run(Object.values(values));
    if (!values.space || !values.patp)
      throw new Error('Failed to create new record');
    const created = this.getMember(values.space, values.patp);
    if (!created) throw new Error('Failed to create new record');
    return created;
  }

  public getMember(path: string, patp: string): Member | null {
    const query = `SELECT * FROM ${this.tableName} WHERE space = ? and patp = ?`;
    const stmt = this.prepare(query);
    const row = stmt.get(path, patp);
    return row ? this.mapRow(row) : null;
  }

  public updateMember(
    path: string,
    patp: string,
    values: Partial<Member>
  ): Member {
    if (values.roles) values.roles = JSON.stringify(values.roles);
    const setClause = Object.keys(values)
      .map((key) => `${key} = ?`)
      .join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE space = ? and patp = ?`;
    const stmt = this.prepare(query);
    stmt.run([...Object.values(values), path, patp]);
    const updated = this.getMember(path, patp);
    if (!updated) throw new Error('Failed to update record');
    return updated;
  }

  public deleteMember(path: string, patp: string): void {
    const query = `DELETE FROM ${this.tableName} WHERE space = ? and patp = ?`;
    const stmt = this.prepare(query);
    stmt.run(path, patp);
  }
}

export const spacesMembersInitSql = `
  create table if not exists spaces_members (
      space     text not null,
      patp      text not null,
      roles     text not null,
      alias     text,
      status    text not null
  );
  create unique index if not exists spaces_members_patp_uindex on spaces_members (space, patp);
`;

export const spacesMembersWipeSql = `drop table if exists spaces_members;`;

export const spacesMembersDBPreload = MembersDB.preload(new MembersDB(true));
