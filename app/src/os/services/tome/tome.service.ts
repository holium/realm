import { BaseService } from '../base.service';
import { Realm } from '../../index';
import { IpcMainInvokeEvent, ipcMain, ipcRenderer } from 'electron';
import { TomeApi } from 'os/api/tome';
import { TomeOptions } from './models/types';
import { SpacesApi } from 'os/api/spaces';
import { Tome } from './models/tome';

export class TomeService extends BaseService {
  handlers = {
    'realm.tome.initTome': this.initTome,
  };

  static preload = {
    initTome: async (urbit?: boolean, app?: string, options?: TomeOptions) => {
      return await ipcRenderer.invoke(
        'realm.tome.initTome',
        urbit,
        app,
        options
      );
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-expect-error
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  async initTome(
    _event: IpcMainInvokeEvent,
    urbit?: boolean,
    app?: string,
    options: TomeOptions = {}
  ) {
    const appName = app ?? 'all';
    if (urbit) {
      if (!this.core.conduit) throw new Error('No conduit found');
      if (!this.core.conduit.ship) throw new Error('Conduit must have a ship');

      let locked = false;
      const inRealm = options.realm ?? false;
      let tomeShip = options.ship ?? this.core.conduit.ship;
      let space = options.space ?? 'our';
      let spaceForPath = space;

      if (inRealm) {
        if (options.ship && options.space) {
          locked = true;
        } else if (!options.ship && !options.space) {
          try {
            const current = await SpacesApi.getCurrentSpace(this.core.conduit);
            space = current.space;

            const path = current.path.split('/');
            tomeShip = path[1];
            spaceForPath = path[2];
          } catch (e) {
            throw new Error(
              'Tome: no current space found. Make sure Realm is installed / configured, ' +
                'or pass `realm: false` to `Tome.init`.'
            );
          }
        } else {
          throw new Error(
            'Tome: `ship` and `space` must neither or both be specified when using Realm.'
          );
        }
      } else {
        if (spaceForPath !== 'our') {
          throw new Error(
            "Tome: only the 'our' space is currently supported when not using Realm. " +
              'If this is needed, please open an issue.'
          );
        }
      }

      if (!tomeShip.startsWith('~')) {
        tomeShip = `~${tomeShip}`;
      }
      // save api.ship so we know who we are.
      const ourShip = `~${this.core.conduit.ship}`;
      const perm = options.permissions
        ? options.permissions
        : ({ read: 'our', write: 'our', admin: 'our' } as const);
      await TomeApi.initTome(this.core.conduit, tomeShip, space, appName);
      return new Tome(true, {
        tomeShip,
        ourShip,
        space,
        spaceForPath,
        app: appName,
        perm,
        locked,
        inRealm,
      });
      /* TODO return something */
    }
    return new Tome(false, { app: appName, tomeShip: 'zod', ourShip: 'zod' });
    /* TODO return something */
  }
}
