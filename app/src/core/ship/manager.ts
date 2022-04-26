import { ipcRenderer, ipcMain } from 'electron';
import Store from 'electron-store';
import EventEmitter from 'events';
import { Conduit } from '../conduit';

export type ShipPreloadType = {
  getApps: () => Promise<any>;
  getDMs: () => Promise<any>;
};

export class ShipManager extends EventEmitter {
  ship: string = '';
  private conduit?: Conduit;

  constructor() {
    super();
    // TODO password protect data
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
  subscribe(conduit: Conduit, ship: string) {
    this.ship = ship;
    this.conduit = conduit;
    conduit.subscribe('contact-store', '/all', { onEvent: this.onEffect });
    conduit.subscribe('metadata-store', '/app-name/groups', {
      onEvent: this.onEffect,
    });
  }
  //
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
  //
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
