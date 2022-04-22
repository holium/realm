import { ipcRenderer } from 'electron';
import Store from 'electron-store';
import EventEmitter from 'events';
import { Conduit } from '../conduit';

export class ShipManager extends EventEmitter {
  private shipStore: Store;
  private conduit: Conduit;
  private sse: EventSource | null = null;
  private stores?: {
    [key: string]: any;
  };

  constructor(url: string, ship: string, password: string, cookie: string) {
    super();
    // TODO password protect data
    this.shipStore = new Store({ name: ship });
    this.conduit = new Conduit(url, ship, cookie);
    this.onEffect = this.onEffect.bind(this);
  }

  initialize() {
    this.conduit.initialize('contact-store', '/all', this.onEffect);
  }

  lock() {}

  onEffect(data: any) {
    this.emit('on-effect', data);
  }
}

export const preload = {
  onEffect: (callback: any) => ipcRenderer.on('on-effect', callback),
};

export type ShipManagerType = {
  onEffect: (callback: any) => Promise<any>;
};
