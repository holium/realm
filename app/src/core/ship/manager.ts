import { ipcRenderer } from 'electron';
import Store from 'electron-store';
import EventEmitter from 'events';
import { Conduit } from '../conduit';

export type ShipPreloadType = {
  onEffect: (callback: any) => Promise<any>;
  getApps: (callback: any) => Promise<any>;
  getDMs: (callback: any) => Promise<any>;
};

export class ShipManager extends EventEmitter {
  ship: string = '';

  constructor() {
    super();
    // TODO password protect data
    this.onEffect = this.onEffect.bind(this);
  }

  initialize(conduit: Conduit, ship: string) {
    this.ship = ship;

    conduit.subscribe('contact-store', '/all', { onEvent: this.onEffect });
    conduit.subscribe('metadata-store', '/app-name/groups', {
      onEvent: this.onEffect,
    });

    conduit
      .scry('graph-store', `/graph/${this.ship}/dm-inbox`)
      .then(this.onEffect);
    conduit.scry('docket', '/charges').then(this.onEffect);

    // conduit.scry('contact-store', `/contact/${this.ship}`).then(this.onEffect); // gets current profile info
  }

  lock() {}

  onEffect(data: any) {
    this.emit('on-effect', data);
  }

  static preload = {
    onEffect: (callback: any) => ipcRenderer.on('on-effect', callback),
    getApps: (callback: any) => ipcRenderer.on('get-apps', callback),
    getDMs: (callback: any) => ipcRenderer.on('get-dms', callback),
  };
}
