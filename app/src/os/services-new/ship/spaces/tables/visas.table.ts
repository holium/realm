import { Database } from 'better-sqlite3';
import AbstractDataAccess from '../../../abstract.db';

export interface Invitation {
  path: string;
  patp: string;
  inviter: string;
  role: string;
  message: string;
  name: string;
  type: string;
  picture?: string;
  color?: string;
  invitedAt: number;
  // createdAt: number;
  // updatedAt: number;
}

export class InvitationDB extends AbstractDataAccess<Invitation> {
  constructor(preload: boolean, db?: Database) {
    super({
      preload: preload,
      db,
      name: 'invitationDB',
      tableName: 'spaces_invitations',
    });
    if (preload) {
      return;
    }
  }

  protected mapRow(row: any): Invitation {
    return {
      path: row.path,
      patp: row.patp,
      inviter: row.inviter,
      role: row.role,
      message: row.message,
      name: row.name,
      type: row.type,
      picture: row.picture,
      color: row.color,
      invitedAt: row.invitedAt,
      // updatedAt: row.updatedAt,
      // createdAt: row.createdAt,
    };
  }

  public insertAll(spacesInvitations: { [key: string]: Invitation[] }) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO spaces_invitations (
        path,
        patp,
        inviter,
        role,
        message,
        name,
        type,
        picture,
        color,
        invitedAt
      ) VALUES (
        @path,
        @patp,
        @inviter,
        @role,
        @message,
        @name,
        @type,
        @picture,
        @color, 
        @invitedAt
      )`
    );
    console.log('insertAll', spacesInvitations);
    // const insertMany = this.db.transaction((spacesMembers) => {
    //   Object.entries<any>(spacesMembers).forEach(([space, memberList]) => {
    //     Object.entries<any>(memberList).forEach(([patp, member]) => {
    //       insert.run({
    //         space,
    //         patp: patp,
    //         roles: JSON.stringify(member.roles),
    //         alias: member.alias || '',
    //         status: member.status,
    //       });
    //     });
    //   });
    // });
    // insertMany(spacesMembers);
    // this.sendUpdate({
    //   type: 'insert',
    //   payload: this.find(),
    // });
  }
}

export const spacesInvitationsInitSql = `
  create table if not exists spaces_invitations (
      path text not null,
      patp text not null,
      inviter text not null,
      role text not null,
      message text not null,
      name text not null,
      type text not null,
      picture text,
      color text,
      invitedAt integer not null,
      primary key (path, patp),
      foreign key (path) references spaces (path) on delete cascade
  );
  create unique index if not exists spaces_invitations_patp_uindex on spaces_invitations (patp, path);
`;

export const spacesMembersDBPreload = InvitationDB.preload(
  new InvitationDB(true)
);
