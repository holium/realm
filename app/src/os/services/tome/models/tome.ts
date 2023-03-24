/*
  Classes returned by `initTome` for direct use by external apps.
  These simply dispatch the relevant IPC calls to Realm.
*/
import {
  InitTomeOptions,
  StoreOptions,
  Permissions,
  InitStoreOptions,
} from './types';

export class Tome {
  public tomeShip: string;
  public ourShip: string;
  public app: string;

  public space: string;
  public spaceForPath: string; // space name as woad (encoded)
  public locked: boolean; // if true, Tome is locked to the initial ship and space.
  public realm: boolean; // whether we are in realm (whether to switch with space changes)

  // maybe use a different (sub) type here?
  constructor(options: InitTomeOptions) {
    const { tomeShip, ourShip, space, spaceForPath, app, locked, realm } =
      options;
    this.tomeShip = tomeShip;
    this.ourShip = ourShip;
    this.space = space;
    this.spaceForPath = spaceForPath;
    this.app = app;
    this.locked = locked;
    this.realm = realm;
  }

  /**
   * Initialize or connect to a key-value store.
   *
   * @param options  Optional bucket, permissions, preload flag, and callbacks for the store. `permisssions`
   * defaults to the Tome's permissions, `bucket` to `'def'`, and `preload` to `true`.
   * @returns A `KeyValueStore`.
   */
  public async keyvalue(options: StoreOptions = {}) {
    return await window.electron.os.tome.initKeyValueStore(this, options);
  }

  public isOurStore(): boolean {
    return this.tomeShip === this.ourShip;
  }
}

export class KeyValueStore extends Tome {
  public permissions: Permissions;
  public bucket: string;

  public write?: boolean;
  public admin?: boolean;
  public onReadyChange?: (ready: boolean) => void;
  public onWriteChange?: (write: boolean) => void;
  public onAdminChange?: (admin: boolean) => void;

  constructor(options: InitStoreOptions) {
    super(options);
    const {
      permissions,
      bucket,
      write,
      admin,
      onReadyChange,
      onWriteChange,
      onAdminChange,
    } = options;
    this.permissions = permissions;
    this.bucket = bucket;
    this.write = write;
    this.admin = admin;
    this.onReadyChange = onReadyChange;
    this.onWriteChange = onWriteChange;
    this.onAdminChange = onAdminChange;
  }
}
