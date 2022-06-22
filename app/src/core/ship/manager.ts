import { DmApi } from './api/dms';
import { Urbit } from './../urbit/api';

import { ipcRenderer, ipcMain } from 'electron';
import Store from 'electron-store';
import EventEmitter from 'events';
import { ShipModel, ShipModelType } from './stores/ship';

import {
  onSnapshot,
  onPatch,
  castToSnapshot,
  getSnapshot,
  destroy,
} from 'mobx-state-tree';
import { AuthShipType } from 'core/auth/store';
import { DocketApi } from './api/docket';
import { MetadataApi } from './api/metadata';

export class ShipManager extends EventEmitter {
  ship: string = '';
  private conduit?: Urbit;
  private stateTree?: ShipModelType;
  private metadataStore: { [key: string]: any } = {};
  private store?: Store<ShipModelType>;
  private hash?: string;

  constructor() {
    super();
    this.getDMs = this.getDMs.bind(this);
    this.sendDm = this.sendDm.bind(this);
    this.onEffect = this.onEffect.bind(this);
    this.getMetadata = this.getMetadata.bind(this);
    this.getAppPreview = this.getAppPreview.bind(this);
    this.init = this.init.bind(this);

    // ipcMain.handle('ship:get-apps', this.getApps);
    ipcMain.handle('ship:get-dms', this.getDMs);
    ipcMain.handle('ship:send-dm', this.sendDm);
    ipcMain.handle('ship:get-metadata', this.getMetadata);
    ipcMain.handle('ship:accept-dm-request', this.acceptDm);
    ipcMain.handle('ship:decline-dm-request', this.declineDm);
    ipcMain.handle('ship:get-app-preview', this.getAppPreview);

    // ship:remove-dm
    // ship:accept-dm-request
    // ship:reject-dm-request
  }

  private get credentials() {
    // const path: string = `auth${ship}`;
    return {
      cookie: this.stateTree!.cookie!,
      url: this.stateTree!.url!,
    };
  }

  public getStorePath(patp: string) {
    return `ships.${patp}`;
  }
  //
  subscribe(conduit: Urbit, ship: string, shipInfo: any) {
    this.ship = ship;
    this.conduit = conduit;
    // TODO password protect data
    this.store = new Store<ShipModelType>({
      name: `ship.manager.${ship}`,
      accessPropertiesByDotNotation: true,
    });
    let persistedState: ShipModelType = this.store.store;
    // console.log(persistedState.patp);
    // this.stateTree = ShipModel.create(castToSnapshot(persistedState));

    // TODO set up multiple ships properly
    // this is the error
    // (Object type: 'map<string, AnonymousModel>', Path upon death: '/ships/~0bus/docket/apps', Subpath: 'ballot', Action: '/ships/~0bus/docket/apps.@APPLY_SNAPSHOT()')
    // console.log(this.currentShip);
    this.stateTree = ShipModel.create({
      patp: this.ship,
      url: persistedState.url,
      wallpaper: persistedState.wallpaper || null,
      color: persistedState.color || null,
      nickname: persistedState.nickname || null,
      avatar: persistedState.avatar || null,
      cookie: persistedState.cookie || shipInfo.cookie,
      // theme: castToSnapshot(persistedState.theme),
      chat: persistedState.chat
        ? castToSnapshot(persistedState.chat)
        : { loader: { state: 'initial' } },
      contacts: persistedState.contacts
        ? castToSnapshot(persistedState.contacts)
        : { ourPatp: this.ship },
      docket: persistedState.docket
        ? castToSnapshot(persistedState.docket)
        : {},
    });

    onSnapshot(this.stateTree, (snapshot: any) => {
      this.store!.store = snapshot;
    });

    onPatch(this.stateTree, (patch) => {
      // send patches to UI store
      const patchEffect = {
        patch,
        resource: 'ship',
        key: this.ship,
        response: 'patch',
      };
      this.onEffect(patchEffect);
    });

    const syncEffect = {
      model: getSnapshot(this.stateTree!),
      resource: 'ship',
      key: this.ship,
      response: 'initial',
    };
    this.onEffect(syncEffect);

    try {
      conduit.subscribe({
        app: 'contact-store',
        path: '/all',
        event: (data: any) => {
          this.stateTree?.contacts.setInitial(data);
        },
        err: () => console.log('Subscription rejected'),
        quit: () => console.log('Kicked from subscription'),
      });
    } catch {
      console.log('Subscription failed');
    }

    MetadataApi.syncGroupMetadata(this.conduit, this.metadataStore);
    MetadataApi.syncGraphMetadata(this.conduit, this.metadataStore);

    // register dm update handler
    DmApi.updates(this.conduit, this.stateTree);
    DmApi.graphUpdates(this.conduit, this.stateTree);

    // load initial dms
    this.getDMs().then((response) => {
      this.stateTree?.chat.setDMs(this.ship, response);
    });

    DocketApi.getApps(this.conduit).then((apps) => {
      this.stateTree?.docket.setInitial(apps);
    });
  }

  async init(ship: string) {
    const syncEffect = {
      model: getSnapshot(this.stateTree!),
      resource: 'ship',
      key: ship,
      response: 'initial',
    };
    this.onEffect(syncEffect);
  }

  //

  lock() {
    destroy(this.stateTree);
    // TODO verify data is encrypted on lock
  }

  getMetadata = (_event: any, path: string) => {
    return this.metadataStore[path];
  };

  getAppPreview = async (_event: any, ship: string, desk: string) => {
    return await DocketApi.requestTreaty(
      ship,
      desk,
      this.stateTree?.docket,
      this.conduit!,
      this.metadataStore
    );
  };

  // -------------------------------------------------------
  // --------------------- DM handlers ---------------------
  // -------------------------------------------------------
  getDMs = async () => {
    if (!this.conduit) {
      return;
    }
    return await DmApi.getDMs(this.stateTree?.patp!, this.conduit);
  };
  // getGroupDMs = async () => {
  //   if (!this.conduit) {
  //     return;
  //   }
  //   return await DmApi.getGroupDMs(this.stateTree?.patp!, this.conduit);
  // };
  acceptDm = async (_event: any, toShip: string) => {
    const ourShip = this.stateTree?.patp!;
    const credentials = this.credentials;
    console.log('acceptingDM', toShip);
    const response = await DmApi.acceptDm(ourShip, toShip, credentials);
    return response;
  };
  declineDm = async (_event: any, toShip: string) => {
    const ourShip = this.stateTree?.patp!;
    const credentials = this.credentials;
    console.log('acceptingDM', toShip);
    const response = await DmApi.acceptDm(ourShip, toShip, credentials);
    return response;
  };
  sendDm = async (_event: any, toShip: string, contents: any[]) => {
    const ourShip = this.stateTree?.patp!;
    const credentials = this.credentials;

    const response = await DmApi.sendDM(ourShip, toShip, contents, credentials);
    // console.log(response, contents);
    return response;
  };
  removeDm = async (_event: any, toShip: string, removeIndex: any) => {
    const ourShip = this.stateTree?.patp!;
    const credentials = this.credentials;
    console.log('removingDM', toShip, removeIndex);
  };

  // onAction(action: {
  //   action: string;
  //   resource: string;
  //   context: { [resource: string]: string };
  //   data: {
  //     key: string;
  //     value: any;
  //   };
  // }) {
  //   // this.store.set(
  //   //   `${action.resource}.${action.context.ship}.${action.data.key}`,
  //   //   action.data.value
  //   // );
  //   // const patchEffect = {
  //   //   patch,
  //   //   resource: 'ship',
  //   //   key: this.ship,
  //   //   response: 'patch',
  //   // };
  //   // this.onEffect();
  // }
  setTheme() {}
  storeNewShip(ship: AuthShipType): ShipModelType {
    const newShip = ShipModel.create({
      patp: ship.patp,
      url: ship.url,
      cookie: ship.cookie,
      wallpaper: ship.wallpaper || null,
      color: ship.color || null,
      nickname: ship.nickname || null,
      avatar: ship.avatar || null,
      chat: { loader: { state: 'initial' } },
      contacts: { ourPatp: this.ship },
      docket: {},
    });
    this.store = new Store<ShipModelType>({
      name: `ship.manager.${ship.patp}`,
      accessPropertiesByDotNotation: true,
    });

    this.store.store = newShip;
    // this.stateTree?.setNewShip(newShip);
    return newShip;
  }
  removeShip(patp: string) {
    const deletedShip = new Store<ShipModelType>({
      name: `ship.manager.${patp}`,
      accessPropertiesByDotNotation: true,
    });
    deletedShip.clear();
    // this.stateTree.deleteShip(patp);
  }
  // -------------------------------------------------------
  // ----------------------- ACTIONS -----------------------
  // -------------------------------------------------------
  onEffect(data: any) {
    this.emit('on-effect', data);
  }
  //
  static preload = {
    getApps: () => {
      return ipcRenderer.invoke('ship:get-apps');
    },
    getAppPreview: (ship: string, desk: string) => {
      return ipcRenderer.invoke('ship:get-app-preview', ship, desk);
    },
    getDMs: () => {
      return ipcRenderer.invoke('ship:get-dms');
    },
    getMetadata: (path: string) => {
      return ipcRenderer.invoke('ship:get-metadata', path);
    },
    acceptDm: (toShip: string) => {
      return ipcRenderer.invoke('ship:accept-dm-request', toShip);
    },
    declineDm: (toShip: string) => {
      return ipcRenderer.invoke('ship:decline-dm-request', toShip);
    },
    setScreen: (screen: boolean) => {
      return ipcRenderer.invoke('ship:set-dm-screen', screen);
    },
    sendDm: (toShip: string, content: any) => {
      return ipcRenderer.invoke('ship:send-dm', toShip, content);
    },
    removeDm: (ship: string, index: any) => {
      return ipcRenderer.invoke('ship:remove-dm', ship, index);
    },
  };
}

export type ShipPreloadType = {
  getApps: () => Promise<any>;
  getAppPreview: (ship: string, desk: string) => Promise<any>;
  // Direct message controls
  getDMs: () => Promise<any>;
  getMetadata: (path: string) => any;
  acceptDm: (ship: string) => Promise<any>;
  declineDm: (ship: string) => Promise<any>;
  setScreen: (screen: boolean) => Promise<any>;
  sendDm: (toShip: string, content: any[]) => Promise<any>;
  removeDm: (ship: string, index: any) => Promise<any>;
};
