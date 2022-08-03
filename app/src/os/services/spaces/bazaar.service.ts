import { ipcMain, ipcRenderer } from 'electron';
import Store from 'electron-store';
import { getSnapshot } from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import { AppModel, BazaarStore, BazaarStoreType } from './models/bazaar';

import { BazaarApi } from '../../api/bazaar';

/**
 * BazaarService
 */
export class BazaarService extends BaseService {
  private state?: BazaarStoreType; // for state management
  handlers = {
    'realm.spaces.bazaar.get-apps': this.getApps,
  };

  static preload = {
    getApps: (path: any) => {
      return ipcRenderer.invoke('realm.spaces.bazaar.get-apps', path);
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async getApps(_event: any, path: string) {
    console.log(path);
    const response = await BazaarApi.getApps(this.core.conduit!, path);
    console.log(response);
    return response;
  }
}
