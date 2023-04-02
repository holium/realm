import { app } from 'electron';
import log from 'electron-log';
import { ConduitSession } from './../conduit';
import AbstractService, { ServiceOptions } from '../abstract.service';
import { ShipDB } from './ship.db';
import { ChatDAO } from './models/chat.model';
import APIConnection from '../conduit';
import RoomsService from './rooms.service';

export class ShipService extends AbstractService {
  private patp: string;
  private readonly shipDB?: ShipDB;
  models?: {
    chat: ChatDAO;
    notifications: null;
    passports: null;
    friends: null;
  };
  services?: {
    rooms: RoomsService;
  };

  constructor(patp: string, password: string, options?: ServiceOptions) {
    super('shipService', options);
    this.patp = patp;
    if (options?.preload) {
      return;
    }
    this.shipDB = new ShipDB(this.patp, password);
    const credentials = this.shipDB.getCredentials();
    log.info('credentials', credentials);
    if (!this.shipDB || !credentials) {
      log.info(`No ship found for ${patp}`);
      return;
    }

    // create an instance of the conduit
    APIConnection.getInstance(credentials).conduit.on(
      'refreshed',
      (session: ConduitSession) => {
        this.shipDB?.setCredentials(session.url, session.code, session.cookie);
      }
    );
    // init all models
    this.models = {
      chat: new ChatDAO(this.shipDB.db),
      notifications: null,
      passports: null,
      friends: null,
    };

    this.services = {
      rooms: new RoomsService(),
    };

    this.sendUpdate({
      type: 'ready',
      payload: {
        patp,
      },
    });

    // app.on('refresh', () => {
    //   this.shipDB?.disconnect();
    //   APIConnection.getInstance(credentials).conduit.removeAllListeners();
    //   this.removeAllListeners();
    // });

    app.on('quit', () => {
      this.shipDB?.disconnect();
      APIConnection.getInstance(credentials).conduit.removeAllListeners();
    });
  }

  decryptDb(password: string) {
    this.shipDB?.decrypt(password);
  }

  getMessages() {
    return this.shipDB?.getMessages();
  }
}

export default ShipService;

// Generate preload
export const shipPreload = ShipService.preload(
  new ShipService('', '', { preload: true })
);
