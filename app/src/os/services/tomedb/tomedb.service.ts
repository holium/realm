import { BaseService } from '../base.service';
import { Realm } from '../../index';
import { IpcMainInvokeEvent, ipcMain, ipcRenderer } from 'electron';
import { TomeApi } from '../../api/tomedb';
import { StoreOptions, TomeOptions } from './models/types';
import { SpacesApi } from '../../api/spaces';
import { KeyValueStore, Tome } from './models/tomedb';
import { agent } from './models/constants';

export class TomeDBService extends BaseService {
  handlers = {
    'realm.tomedb.initTome': this.initTome,
    'realm.tomedb.initKeyValueStore': this.initKeyValueStore,
  };

  static preload = {
    initTome: async (app?: string, options?: TomeOptions) => {
      const response = await ipcRenderer.invoke(
        'realm.tomedb.initTome',
        app,
        options
      );
      console.error(response);
      console.error(new Tome(response));
      return new Tome(response);
    },
    initKeyValueStore: async (tome: Tome, options?: StoreOptions) => {
      return await ipcRenderer.invoke(
        'realm.tomedb.initKeyValueStore',
        tome,
        options
      );
    },
  };

  async subscribe() {
    await this.core.conduit?.watch({
      app: agent,
      path: '/slip/local',
      onEvent: this.handleSlip,
      onQuit: this.onQuit,
      onError: this.onError,
    });
  }

  constructor(core: Realm, options: any = {}) {
    super(core, options);
    this.subscribe();
    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-expect-error
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  async initTome(
    _event: IpcMainInvokeEvent,
    app?: string,
    options: TomeOptions = {}
  ) {
    const appName = app ?? 'all';
    if (!this.core.conduit) throw new Error('No conduit found');
    if (!this.core.conduit.ship) throw new Error('Conduit must have a ship');

    let locked = false;
    const realm = options.realm ?? false;
    let tomeShip = options.ship ?? this.core.conduit.ship;
    let space = options.space ?? 'our';
    let spaceForPath = space;

    if (realm) {
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
          throw new Error('Tome: no current space found.');
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
    await TomeApi.initTome(this.core.conduit, tomeShip, space, appName);
    return {
      tomeShip,
      ourShip,
      space,
      spaceForPath,
      app: appName,
      locked,
      realm,
    };
  }

  async initKeyValueStore(
    _event: IpcMainInvokeEvent,
    tome: Tome,
    options?: StoreOptions
  ) {
    if (!this.core.conduit) throw new Error('No conduit found');
    let permissions = options?.permissions ?? {
      read: 'our',
      write: 'our',
      admin: 'our',
    };
    const bucket = options?.bucket ?? 'def';
    const { onReadyChange, onWriteChange, onAdminChange } = options ?? {};

    let write;
    let admin;
    if (tome.isOurStore()) {
      write = true;
      admin = true;
      if (tome.app === 'all') {
        console.warn(
          `Tome-KV: Permissions on 'all' are ignored. Setting permissions levels to 'our' instead...`
        );
        permissions = {
          read: 'our',
          write: 'our',
          admin: 'our',
        };
      }
    }
    const keyValueOptions = {
      tomeShip: tome.tomeShip,
      ourShip: tome.ourShip,
      space: tome.space,
      spaceForPath: tome.spaceForPath,
      app: tome.app,
      locked: tome.locked,
      realm: tome.realm,
      permissions,
      bucket,
      write,
      admin,
      onReadyChange,
      onWriteChange,
      onAdminChange,
    };

    if (tome.isOurStore()) {
      await TomeApi.initStore(
        this.core.conduit,
        tome.tomeShip,
        tome.space,
        tome.app,
        bucket,
        permissions
      );
    } else {
      /* 
        Eventually we should _not_ run through all these initialization pokes
        on every connection - Realm should catch if we're already
        good to go.  That will require a lot more logic, though.
      */
      await TomeApi.checkBucketExistsAndCanRead(
        this.core.conduit,
        tome.tomeShip,
        tome.space,
        tome.app,
        bucket
      );
      const foreignPerm = {
        read: 'yes',
        write: 'unset',
        admin: 'unset',
      } as const;
      await TomeApi.initStore(
        this.core.conduit,
        tome.tomeShip,
        tome.space,
        tome.app,
        bucket,
        foreignPerm
      );
      await TomeApi.startWatchingForeignBucket(
        this.core.conduit,
        tome.tomeShip,
        tome.space,
        tome.app,
        bucket
      );
      await TomeApi.getCurrentForeignBucketPermissions(
        this.core.conduit,
        tome.tomeShip,
        tome.space,
        tome.app,
        bucket
      );
    }
    return new KeyValueStore(keyValueOptions);
  }
}
