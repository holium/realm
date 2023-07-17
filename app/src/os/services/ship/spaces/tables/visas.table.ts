// import log from 'electron-log';
import Database from 'better-sqlite3-multiple-ciphers';

import AbstractDataAccess from '../../../abstract.db';

export interface Invitation {
  path: string;
  role: string;
  message: string;
  name: string;
  type: string;
  picture?: string;
  color?: string;
  inviter: string;
  invitedAt: number;
  // createdAt: number;
  // updatedAt: number;
}

export class InvitationDB extends AbstractDataAccess<Invitation, any> {
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
      role: row.role,
      message: row.message,
      name: row.name,
      type: row.type,
      picture: row.picture,
      color: row.color,
      inviter: row.inviter,
      invitedAt: row.invitedAt,
      // updatedAt: row.updatedAt,
      // createdAt: row.createdAt,
    };
  }

  public insertAll(spacesInvitations: { [key: string]: Invitation }) {
    if (!this.db?.open) return;
    const insert = this.db.prepare(
      `REPLACE INTO spaces_invitations (
        path,
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

    const insertMany = this.db.transaction((spacesMembers: any) => {
      Object.entries<Invitation>(spacesMembers).forEach(([space, invite]) => {
        insert.run({
          path: space,
          name: invite.name,
          role: invite.role,
          picture: invite.picture,
          message: invite.message,
          color: invite.color,
          type: invite.type,
          inviter: invite.inviter,
          invitedAt: invite.invitedAt,
        });
      });
    });
    insertMany(spacesInvitations);
    return spacesInvitations;
  }

  removeInvite(path: string) {
    if (!this.db) return;
    const deleteInvite = this.db.prepare(
      `DELETE FROM spaces_invitations WHERE path = ?`
    );
    deleteInvite.run(path);
  }
}

export const spacesInvitationsInitSql = `
  create table if not exists spaces_invitations (
      path text not null,
      name text not null,
      role text not null,
      picture text,
      message text not null,
      color text,
      type text not null,
      inviter text not null,
      invitedAt integer not null,
      primary key (path)
  );
  create unique index if not exists spaces_invitations_uindex on spaces_invitations (path);
`;

export const spacesInvitationsWipeSql = `drop table if exists spaces_invitations;`;

export const spacesMembersDBPreload = InvitationDB.preload(
  new InvitationDB(true)
);
