import { ContactModel, ContactStore } from './stores/contacts';
import { toJS } from 'mobx';

import { ipcRenderer, ipcMain } from 'electron';
import Store from 'electron-store';
import EventEmitter from 'events';
import { Conduit } from '../conduit';
import { ShipInfoType } from './types';
import { ShipModel, ShipModelType } from './stores/ship';
import { ChatStore } from './stores/dms';
import { cleanNounColor } from '../../renderer/logic/utils/color';

import {
  onSnapshot,
  onPatch,
  castToSnapshot,
  getSnapshot,
  destroy,
} from 'mobx-state-tree';

export type ShipPreloadType = {
  getApps: () => Promise<any>;
  getDMs: () => Promise<any>;
};

export class ShipManager extends EventEmitter {
  ship: string = '';
  private conduit?: Conduit;
  private stateTree?: ShipModelType;
  private store: Store<{ [ship: string]: ShipModelType }>;

  constructor() {
    super();
    // TODO password protect data
    this.store = new Store<Record<string, ShipModelType>>({
      name: 'ship.manager',
      accessPropertiesByDotNotation: true,
    });
    this.getApps = this.getApps.bind(this);
    this.getDMs = this.getDMs.bind(this);
    this.onEffect = this.onEffect.bind(this);
    this.init = this.init.bind(this);
  }
  //
  initialize() {
    ipcMain.handle('ship:get-apps', this.getApps);
    ipcMain.handle('ship:get-dms', this.getDMs);
  }
  //
  subscribe(conduit: Conduit, ship: string, shipInfo: any) {
    console.log('SUBSCRIBING');
    this.ship = ship;
    this.conduit = conduit;
    const shipPath: string = `ship.manager.${this.ship}`;
    let persistedState: ShipModelType = this.store.get(shipPath);
    // console.log(persistedState.patp);
    this.stateTree = ShipModel.create({
      patp: this.ship,
      url: persistedState.url,
      wallpaper: persistedState.wallpaper || null,
      color: persistedState.color || null,
      nickname: persistedState.nickname || null,
      avatar: persistedState.avatar || null,
      cookie: persistedState.cookie || shipInfo.cookie,
      theme: castToSnapshot(persistedState.theme),
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
      // console.log('snapshotting, sync with UI', snapshot);
      this.store.set(shipPath, snapshot);
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
      model: getSnapshot(this.stateTree),
      resource: 'ship',
      key: this.ship,
      response: 'initial',
    };
    this.onEffect(syncEffect);
    conduit.subscribe('contact-store', '/all', {
      onEvent: (data: any) => this.stateTree?.contacts.setInitial(data.json),
    });
    // conduit.subscribe('metadata-store', '/app-name/groups', {
    //   onEvent: this.onEffect,
    // });
    // load initial dms
    this.getDMs().then((response) => {
      this.stateTree?.chat.setDMs(
        this.ship,
        response['graph-update']['add-graph']['graph']
      );
    });
    this.getApps().then((apps) => {
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

  async getApps() {
    if (!this.conduit) {
      return;
    }
    const response = await this.conduit.scry('docket', '/charges');
    const appMap = response.json?.data.initial;
    Object.keys(appMap).forEach((appKey: string) => {
      const appColor = appMap[appKey].color;
      appMap[appKey].color = appColor && cleanNounColor(appColor);
    });
    return appMap;
  }
  //
  async getDMs() {
    if (!this.conduit) {
      return;
    }
    const response = await this.conduit.scry(
      'graph-store',
      `/graph/${this.ship}/dm-inbox`
    );
    const { json } = response;
    return json!.data;
  }

  lock() {
    destroy(this.stateTree);
    // TODO verify data is encrypted on lock
  }
  // -------------------------------------------------------
  // ----------------------- ACTIONS -----------------------
  // -------------------------------------------------------
  onAction(action: {
    action: string;
    resource: string;
    context: { [resource: string]: string };
    data: {
      key: string;
      value: any;
    };
  }) {
    this.store.set(
      `${action.resource}.${action.context.ship}.${action.data.key}`,
      action.data.value
    );
    // const patchEffect = {
    //   patch,
    //   resource: 'ship',
    //   key: this.ship,
    //   response: 'patch',
    // };
    // this.onEffect();
  }
  setTheme() {}
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
    getDMs: () => {
      return ipcRenderer.invoke('ship:get-dms');
    },

    // getApps: (callback: any) => ipcRenderer.on('get-apps', callback),
    // getDMs: (callback: any) => ipcRenderer.on('get-dms', callback),
  };
}
