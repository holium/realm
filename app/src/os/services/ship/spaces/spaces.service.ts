import AbstractService, { ServiceOptions } from '../../abstract.service';
import { Database } from 'better-sqlite3-multiple-ciphers';
import log from 'electron-log';
import { APIConnection } from '../../api';
import { SpacesDB, spacesInitSql } from './tables/spaces.table';
import { MembersDB, spacesMembersInitSql } from './tables/members.table';
import { humanFriendlySpaceNameSlug } from '../../../lib/text';
import { snakeify } from '../../../lib/obj';
import { pathToObj } from '../../../lib/path';
import { InvitationDB, spacesInvitationsInitSql } from './tables/visas.table';
import { spacesModelQuery } from './spaces.query';
import { MemberRole } from '../../../types';
import {
  FeaturedSpacesDB,
  spacesFeaturedInitSql,
} from './tables/featured.table';

export class SpacesService extends AbstractService {
  private shipDB?: Database;
  public spacesDB?: SpacesDB;
  public membersDB?: MembersDB;
  public invitationsDB?: InvitationDB;
  public featuredSpacesDB?: FeaturedSpacesDB;
  private patp?: string;

  constructor(options?: ServiceOptions, db?: Database, patp?: string) {
    super('spacesService', options);
    if (options?.preload) return;
    this.patp = patp;
    this.shipDB = db;
    this.spacesDB = new SpacesDB(false, db);
    this.membersDB = new MembersDB(false, db);
    this.invitationsDB = new InvitationDB(false, db);
    this.featuredSpacesDB = new FeaturedSpacesDB(false, db);

    this._onEvent = this._onEvent.bind(this);

    APIConnection.getInstance().conduit.watch({
      app: 'spaces',
      path: `/updates`,
      onEvent: this._onEvent,
      onQuit: this._onQuit,
      onError: this._onError,
    });
  }

  public async init() {
    this.fetchInviteData();
  }

  public async fetchInviteData() {
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'spaces',
      path: `/invitations`,
    });
    if (response) {
      const invites = this.invitationsDB?.insertAll(response.invitations);
      this.sendUpdate({
        type: 'invitations',
        payload: invites,
      });
    }
  }

  reset(): void {
    super.reset();
    this.spacesDB?.reset();
    this.membersDB?.reset();
    this.invitationsDB?.reset();
    this.featuredSpacesDB?.reset();
  }

  private _onEvent = (data: any, _id?: number, mark?: string) => {
    if (mark === 'spaces-reaction') {
      const spacesType = Object.keys(data)[0];
      switch (spacesType) {
        case 'initial':
          this.spacesDB?.insertAll(data['initial'].spaces);
          this.spacesDB?.setCurrent(data['initial'].current.path);
          this.membersDB?.insertAll(data['initial'].membership);
          this.sendUpdate({
            type: 'initial',
            payload: data['initial'],
          });
          break;
        case 'add':
          const addedSpace = data['add'];
          addedSpace.current = 1;
          const addedPath = addedSpace.space.path;
          this.spacesDB?.insertAll({ [addedPath]: addedSpace.space });
          this.spacesDB?.setCurrent(addedPath);
          this.membersDB?.insertAll({
            [addedPath]: addedSpace.members,
          });
          this.sendUpdate({
            type: 'add',
            payload: this.getSpace(addedPath),
          });
          break;
        case 'remove':
          const removedPath = data['remove']['space-path'];
          let resetToHomeSpace = false;
          if (this.spacesDB?.findOne(removedPath)?.current) {
            this.setSelectedSpace(`/${this.patp}/our`);
            resetToHomeSpace = true;
          }
          this.spacesDB?.delete(data['remove']['space-path']);
          this.sendUpdate({
            type: 'remove',
            payload: { path: removedPath, resetToHomeSpace },
          });
          break;
        case 'replace':
          const replacePayload = data['replace'];
          log.info('replace', replacePayload);
          const replacePath = replacePayload.space.path;
          this.spacesDB?.update(replacePath, replacePayload.space);
          const updatedSpace = this.getSpace(replacePath);

          log.info(updatedSpace);
          this.sendUpdate({
            type: 'replace',
            payload: this.getSpace(replacePath),
          });
          break;
        case 'remote-space':
          // when a remote space is added, we need to add it to our local db
          const remoteSpace = data['remote-space'];
          this.spacesDB?.insertAll({ [remoteSpace.path]: remoteSpace.space });
          this.spacesDB?.setCurrent(remoteSpace.path);
          this.membersDB?.insertAll({
            [remoteSpace.path]: remoteSpace.members,
          });
          this.sendUpdate({
            type: 'add',
            payload: this.getSpace(remoteSpace.path),
          });
          break;
        default:
          break;
      }
    }
    if (mark === 'visa-reaction') {
      const visaData = data[mark];
      const visaType = Object.keys(visaData)[0];

      switch (visaType) {
        case 'invite-sent':
          const sentPayload = visaData['invite-sent'];
          this.membersDB?.createMember({
            space: sentPayload.path,
            patp: sentPayload.ship,
            ...sentPayload.member,
          });
          this.sendUpdate({
            type: 'invite-sent',
            payload: sentPayload,
          });
          break;
        case 'invite-accepted':
          const acceptedPayload = visaData['invite-accepted'];
          const updated = this.membersDB?.updateMember(
            acceptedPayload.path,
            acceptedPayload.ship,
            acceptedPayload.member
          );
          this.sendUpdate({
            type: 'invite-updated',
            payload: {
              path: acceptedPayload.path,
              ship: acceptedPayload.ship,
              member: {
                alias: updated?.alias,
                roles: updated?.roles,
                status: updated?.status,
              },
            },
          });
          break;
        case 'invite-received':
          const receivedPayload = visaData[visaType];
          const invites = this.invitationsDB?.insertAll({
            [receivedPayload.path]: receivedPayload.invite,
          });
          this.sendUpdate({
            type: 'invitations',
            payload: invites,
          });
          break;
        case 'invite-removed': // this is when an invite is declined by our or after we have accepted it
          const path = visaData[visaType].path;
          this.invitationsDB?.removeInvite(path);
          break;
        case 'kicked':
          const kickedPayload = visaData.kicked;
          this.membersDB?.deleteMember(kickedPayload.path, kickedPayload.ship);
          this.sendUpdate({
            type: 'kicked',
            payload: kickedPayload,
          });
          break;
        case 'edited':
          const editedPayload = visaData.edited;
          const editedUpdated = this.membersDB?.updateMember(
            editedPayload.path,
            editedPayload.ship,
            {
              roles: editedPayload.roles,
            }
          );
          this.sendUpdate({
            type: 'invite-updated',
            payload: {
              path: editedPayload.path,
              ship: editedPayload.ship,
              member: {
                alias: editedUpdated?.alias,
                roles: editedUpdated?.roles,
                status: editedUpdated?.status,
              },
            },
          });
          break;
        case 'invite-declined':
          log.info('invite-declined', visaData[visaType]);
          // this.invitationsDB?.removeInvite(path);

          break;
        case 'invite-expired':
          break;
        default:
          break;
      }
    }
  };

  private _onQuit = () => {
    log.warn('Spaces subscription quit');
  };

  private _onError = (err: any) => {
    log.warn('Spaces subscription error', err);
  };

  public async getInitial() {
    if (!this.shipDB) return;
    const query = this.shipDB.prepare(spacesModelQuery);
    const result: any = query.all();
    const currentSpace = result.filter((row: any) => row.current === 1)[0];

    return {
      current: currentSpace ? currentSpace.path : null,
      spaces: result.map((row: any) => {
        return {
          ...row,
          current: row.current === 1,
          archetype: row.archetype || 'community',
          theme: row.theme ? JSON.parse(row.theme) : null,
          members: row.members ? JSON.parse(row.members) : null,
          dock: row.dock ? JSON.parse(row.dock) : [],
          stall: row.stall
            ? JSON.parse(row.stall)
            : { suite: {}, recommended: {} },
        };
      }),
    };
  }

  public getSpace(path: string) {
    if (!this.shipDB) return;
    const query = this.shipDB.prepare(`
        ${spacesModelQuery}
        WHERE path = ?
    `);
    const result: any = query.all(path);

    const space = result[0];

    return {
      ...space,
      current: space.current === 1,
      archetype: space.archetype || 'community',
      theme: space.theme ? JSON.parse(space.theme) : null,
      members: space.members ? JSON.parse(space.members) : null,
      dock: space.dock ? JSON.parse(space.dock) : [],
      stall: space.stall
        ? JSON.parse(space.stall)
        : { suite: {}, recommended: {} },
    };
  }

  public async setSelectedSpace(path: string) {
    this.spacesDB?.setCurrent(path);
    console.log('setting current space to', path, pathToObj(path));
    APIConnection.getInstance().conduit.poke({
      app: 'spaces',
      mark: 'spaces-action',
      json: {
        current: {
          path: pathToObj(path),
        },
      },
    });
  }

  public async createSpace(newSpace: NewSpace) {
    const members = newSpace.members;
    const slug = humanFriendlySpaceNameSlug(newSpace.name);
    const spacePath: string = await new Promise((resolve, reject) => {
      APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          add: {
            slug,
            payload: snakeify({
              name: newSpace.name,
              description: newSpace.description,
              type: newSpace.type,
              access: newSpace.access,
              picture: newSpace.picture,
              color: newSpace.color,
              archetype: newSpace.archetype,
            }),
            members,
          },
        },
        reaction: 'spaces-reaction.add',
        onReaction: (data: any) => {
          // TODO: add to db
          log.info('created space', data.add.space.path);
          resolve(data.add.space.path);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
    return spacePath;
  }

  public async joinSpace(path: string): Promise<void> {
    log.info({
      join: {
        path: pathToObj(path),
      },
    });
    return await new Promise((resolve, reject) => {
      APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          join: {
            path: pathToObj(path),
          },
        },
        reaction: 'spaces-reaction.remote-space',
        onReaction: (data: any) => {
          console.log('joined space -> success');
          // TODO: add to db
          // check if matches path
          resolve(data);
        },
        onError: (e: any) => {
          log.info('failed to join space', e);
          reject(e);
        },
      });
    });
  }

  public async updateSpace(path: string, payload: any): Promise<string> {
    return await new Promise((resolve, reject) => {
      console.log({
        path: pathToObj(path),
        payload: {
          name: payload.name,
          description: payload.description,
          access: payload.access,
          picture: payload.picture,
          color: payload.color,
          theme: snakeify(payload.theme),
        },
      });
      APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          update: {
            path: pathToObj(path),
            payload: {
              name: payload.name,
              description: payload.description,
              access: payload.access,
              picture: payload.picture,
              color: payload.color,
              theme: snakeify(payload.theme),
            },
          },
        },
        reaction: 'spaces-reaction.replace',
        onReaction: (data: any) => {
          // TODO: update the db
          console.log('updated space -> success');
          resolve(data);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  }

  public async deleteSpace(path: string): Promise<void> {
    return await new Promise((resolve, reject) => {
      APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          remove: {
            path: pathToObj(path),
          },
        },
        reaction: 'spaces-reaction.remove',
        onReaction: (data: any) => {
          // TODO: remove from db
          console.log('deleted space -> success');
          resolve(data);
        },
        onError: (e: any) => {
          reject(e);
          log.info('failed to delete space', e);
        },
      });
    });
  }

  public async leaveSpace(path: string): Promise<void> {
    return await new Promise((resolve, reject) => {
      APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'spaces-action',
        json: {
          leave: {
            path: pathToObj(path),
          },
        },
        reaction: 'spaces-reaction.remove',
        onReaction: (data: any) => {
          // TODO: remove from db
          console.log('deleted space -> success');
          resolve(data);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  }

  // Invitations
  public async acceptInvite(path: string): Promise<void> {
    try {
      const response = await APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'visa-action',
        json: {
          'accept-invite': {
            path: pathToObj(path),
          },
        },
      });
      // this.invitationsDB?.delete(path);
      return response;
    } catch (e) {
      log.error(e);
    }
  }
  public async declineInvite(path: string): Promise<void> {
    try {
      const response = await APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'visa-action',
        json: {
          'decline-invite': {
            path: pathToObj(path),
          },
        },
      });
      return response;
    } catch (e) {
      log.error(e);
    }
  }

  public async inviteMember(
    path: string,
    payload: { patp: string; role: MemberRole; message: string }
  ) {
    try {
      const response = await APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'visa-action',
        json: {
          'send-invite': {
            path: pathToObj(path),
            ship: payload.patp,
            role: payload.role,
            message: payload.message,
          },
        },
      });
      return response;
    } catch (e) {
      log.error(e);
    }
  }

  public async kickMember(path: string, patp: string) {
    try {
      const response = await APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'visa-action',
        json: {
          'kick-member': {
            path: pathToObj(path),
            ship: patp,
          },
        },
      });
      return response;
    } catch (e) {
      log.error(e);
    }
  }

  public async setRoles(path: string, patp: string, roles: MemberRole[]) {
    try {
      const response = await APIConnection.getInstance().conduit.poke({
        app: 'spaces',
        mark: 'visa-action',
        json: {
          'edit-member-role': {
            path: pathToObj(path),
            ship: patp,
            roles,
          },
        },
      });
      return response;
    } catch (e) {
      log.error(e);
    }
  }

  public async getFeaturedSpaces() {
    return this.featuredSpacesDB?.getFeaturedSpaces();
  }
}

export default SpacesService;

// Generate preload
export const spacesPreload = SpacesService.preload(
  new SpacesService({ preload: true })
);

export const spacesTablesInitSql = `
 ${spacesInitSql}
 ${spacesInvitationsInitSql}
 ${spacesMembersInitSql}
 ${spacesFeaturedInitSql}
`;

export type NewSpace = {
  name: string;
  description: string;
  color?: string;
  picture?: string;
  access: 'public' | 'antechamber' | 'private';
  archetype: 'home' | 'community';
  archetypeTitle?: 'Home' | 'Community';
  members: { [patp: string]: 'owner' | 'initiate' | 'admin' | 'member' };
  type: 'our' | 'group' | 'space';
};
