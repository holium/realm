import { toJS } from 'mobx';

import { ipcRenderer, ipcMain } from 'electron';
import Store from 'electron-store';
import EventEmitter from 'events';
import { Conduit } from '../conduit';
import { ShipInfoType } from './types';
import { ShipModel, ShipModelType } from './store';
import { onSnapshot, onPatch } from 'mobx-state-tree';

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
    this.store = new Store({
      name: 'ship.manager',
      accessPropertiesByDotNotation: true,
    });
    this.getApps = this.getApps.bind(this);
    this.getDMs = this.getDMs.bind(this);
    this.onEffect = this.onEffect.bind(this);
  }
  //
  initialize() {
    ipcMain.handle('ship:get-apps', this.getApps);
    ipcMain.handle('ship:get-dms', this.getDMs);
  }
  //
  subscribe(conduit: Conduit, ship: string, shipInfo: any) {
    this.ship = ship;
    this.conduit = conduit;
    const shipPath: string = `ship.manager.${this.ship}`;
    let persistedState: ShipModelType = this.store.get(shipPath);
    if (!persistedState) {
      persistedState = shipInfo;
    }

    this.stateTree = ShipModel.create({
      patp: this.ship,
      url: persistedState.url,
      wallpaper: persistedState.wallpaper || null,
      color: persistedState.color || null,
      nickname: persistedState.nickname || null,
      avatar: persistedState.avatar || null,
      theme: {
        textColor: persistedState.theme.textColor || 'light',
        backgroundColor: persistedState.theme.backgroundColor || '#FFFFFF50',
      },
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
      model: toJS(this.stateTree),
      resource: 'ship',
      key: this.ship,
      response: 'initial',
    };
    this.onEffect(syncEffect);
    // conduit.subscribe('contact-store', '/all', { onEvent: this.onEffect });
    // conduit.subscribe('metadata-store', '/app-name/groups', {
    //   onEvent: this.onEffect,
    // });
    // load initial dms
    this.getDMs().then((response) => {
      this.stateTree!.chat.setDMs(
        this.ship,
        response['graph-update']['add-graph']['graph']
      );
    });
  }

  async init(_event: any, ship: string) {
    const syncEffect = {
      model: toJS(this.stateTree),
      resource: 'ship',
      key: ship,
      response: 'initial',
    };
    console.log(syncEffect);
    this.onEffect(syncEffect);
  }

  async getApps() {
    if (!this.conduit) {
      return;
    }
    const response = await this.conduit.scry('docket', '/charges');
    const { json } = response;
    return json!.data;
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

  lock() {}
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
    console.log(this.store);
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
