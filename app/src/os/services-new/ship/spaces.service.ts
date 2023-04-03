import AbstractService, { ServiceOptions } from '../abstract.service';
import sqlite3, { Database } from 'better-sqlite3-multiple-ciphers';

import log from 'electron-log';
import APIConnection from '../conduit';
import { PokeParams, Scry } from '@holium/conduit/src/types';
import { SpacesDB } from './models/spaces.model';
import { MembersDB } from './models/spaces_members.model';

export class SpacesService extends AbstractService {
  public spacesDB?: SpacesDB;
  public membersDB?: MembersDB;

  constructor(options?: ServiceOptions, db?: Database) {
    super('spacesService', options);
    if (options?.preload) {
      return;
    }
    this.spacesDB = new SpacesDB(false, db);
    this.membersDB = new MembersDB(false, db);
    this._onEvent = this._onEvent.bind(this);

    APIConnection.getInstance().conduit.watch({
      app: 'spaces',
      path: `/updates`,
      onEvent: this._onEvent,
      onQuit: this._onQuit,
      onError: this._onError,
    });
  }

  private _onEvent = (data: any, _id?: number, mark?: string) => {
    if (mark === 'spaces-reaction') {
      const spacesType = Object.keys(data)[0];
      switch (spacesType) {
        case 'initial':
          this.spacesDB?.insertAll(data['initial'].spaces);
          this.membersDB?.insertAll(data['initial'].membership);
          break;
        case 'add':
          // this.spacesDB?.insert(data['add']);
          break;
        case 'remove':
          // this.spacesDB?.remove(data['remove']);
          break;
        case 'replace':
          // this.spacesDB?.replace(data['replace']);
          break;
        case 'remote-space':
          // when a remote space is added, we need to add it to our local db
          // this.spacesDB?.remove(data['remote-space']);
          break;
        default:
          break;
      }
    }
    if (mark === 'visa-reaction') {
      const visaType = Object.keys(data)[0];
      switch (visaType) {
        case 'invite-sent':
          break;
        case 'invite-accepted':
          break;
        case 'invite-received':
          break;
        case 'invite-removed':
          break;
        case 'kicked':
          break;
        case 'edited':
          break;
        case 'invite-declined':
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
  // public poke(payload: PokeParams) {
  //   return APIConnection.getInstance().conduit.poke(payload);
  // }
  // public scry(payload: Scry) {
  //   console.log('scry', payload);
  //   return APIConnection.getInstance().conduit.scry(payload);
  // }
}

export default SpacesService;

// Generate preload
export const roomsPreload = SpacesService.preload(
  new SpacesService({ preload: true })
);
