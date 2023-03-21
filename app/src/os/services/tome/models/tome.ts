/*
  Classes returned by `initTome` for direct use by external apps.
  These simply dispatch the relevant IPC calls to Realm.
*/
import {
  InviteLevel,
  StoreType,
  Value,
  Content,
  SubscribeUpdate,
  FeedlogUpdate,
  FeedlogEntry,
  Perm,
  StoreOptions,
  TomeOptions,
  InitStoreOptions,
} from './types';
import {
  agent,
  tomeMark,
  kvMark,
  feedMark,
  kvThread,
  feedThread,
} from './constants';

export class Tome {
  protected urbit: boolean;

  protected tomeShip: string;
  protected ourShip: string;
  protected space?: string;
  protected spaceForPath?: string; // space name as woad (encoded)
  protected app: string;
  protected perm?: Perm;
  protected locked?: boolean; // if true, Tome is locked to the initial ship and space.
  protected inRealm?: boolean;

  // maybe use a different (sub) type here?
  constructor(urbit: boolean, options?: InitStoreOptions) {
    if (urbit) {
      const {
        tomeShip,
        ourShip,
        space,
        spaceForPath,
        app,
        perm,
        locked,
        inRealm,
      } = options;
      this.urbit = true;
      this.tomeShip = tomeShip;
      this.ourShip = ourShip;
      this.space = space;
      this.spaceForPath = spaceForPath;
      this.app = app;
      this.perm = perm;
      this.locked = locked;
      this.inRealm = inRealm;
    } else {
      const { app, tomeShip, ourShip } = options ?? {};
      this.urbit = false;
      this.app = app;
      this.tomeShip = tomeShip;
      this.ourShip = ourShip;
    }
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
}

export class DataStore extends Tome {
  protected ready?: boolean; // if false, we are switching spaces.
  protected onReadyChange?: (ready: boolean) => void;
  protected onWriteChange?: (write: boolean) => void;
  protected onAdminChange?: (admin: boolean) => void;
  protected onDataChange?: (data: any) => void;

  protected cache: Map<string, Value>; // cache key-value pairs

  protected bucket?: string;
  protected write?: boolean;
  protected admin?: boolean;

  protected type?: StoreType;

  constructor(urbit: boolean, options?: InitStoreOptions) {
    super(urbit, options);
    const {
      bucket,
      write,
      admin,
      onReadyChange,
      onWriteChange,
      onAdminChange,
      onDataChange,
      type,
    } = options ?? {};
    this.bucket = bucket;
    this.type = type;
    this.write = write;
    this.admin = admin;
    this.onDataChange = onDataChange;
    this.onReadyChange = onReadyChange;
    this.onWriteChange = onWriteChange;
    this.onAdminChange = onAdminChange;
    this.cache = new Map<string, Value>();
    if (urbit) {
      if (this.inRealm) {
        this.watchCurrentSpace();
      }
      this.setReady(true);
    }
  }
}

// export class KeyValueStore extends DataStore {
//   constructor(options?: InitStoreOptions) {
//     super(options);
//     const {
//       bucket,
//       write,
//       admin,
//       preload,
//       onReadyChange,
//       onLoadChange,
//       onWriteChange,
//       onAdminChange,
//       onDataChange,
//       type,
//       isLog,
//     } = options ?? {};
//     this.bucket = bucket;
//     this.preload = preload;
//     this.type = type;
//     this.write = write;
//     this.admin = admin;
//     this.onDataChange = onDataChange;
//     this.onLoadChange = onLoadChange;
//     this.onReadyChange = onReadyChange;
//     this.onWriteChange = onWriteChange;
//     this.onAdminChange = onAdminChange;
//     this.cache = new Map<string, Value>();
//     this.feedlog = [];
//     this.order = [];
//     if (preload) {
//       this.setLoaded(false);
//     }
//     if (type === 'feed') {
//       this.isLog = isLog;
//     } else {
//       this.isLog = false;
//     }
//     if (this.mars) {
//       if (preload) {
//         this.subscribeAll();
//       }
//       if (this.inRealm) {
//         this.watchCurrentSpace();
//       }
//       this.watchPerms();
//       this.setReady(true);
//     } else {
//       if (preload) {
//         this.getAllLocalValues();
//       }
//     }
//   }
// }
