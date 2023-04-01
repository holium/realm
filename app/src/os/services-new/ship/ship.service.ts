import { app } from 'electron';

import AbstractService, {
  ServiceOptions,
} from '../../services/abstract.service';
import log from 'electron-log';
import { ShipDB } from './ship.db';

export class ShipService extends AbstractService {
  private patp: string;
  private readonly shipDB?: ShipDB;
  models?: {
    chat: null;
    notifications: null;
    passports: null;
    friends: null;
  };
  constructor(patp: string, password: string, options?: ServiceOptions) {
    super('shipService', options);
    this.patp = patp;
    if (options?.preload) {
      return;
    }
    this.shipDB = new ShipDB(this.patp, password);

    this.models = {
      chat: null,
      notifications: null,
      passports: null,
      friends: null,
    };
    app.on('quit', () => {
      this.shipDB?.disconnect();
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
