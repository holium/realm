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
    'realm.spaces.bazaar.get-allies': this.getAllies,
    'realm.spaces.bazaar.get-treaties': this.getTreaties,
  };

  static preload = {
    getApps: (shipName: string, shipPath: string, category: string = 'all') => {
      return ipcRenderer.invoke(
        'realm.spaces.bazaar.get-apps',
        shipName,
        shipPath,
        category
      );
    },
    getAllies: () => {
      return ipcRenderer.invoke('realm.spaces.bazaar.get-allies');
    },
    getTreaties: (shipName: string) => {
      return ipcRenderer.invoke('realm.spaces.bazaar.get-treaties', shipName);
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

  async getApps(
    _event: any,
    shipName: string,
    shipPath: string,
    category: string = 'all'
  ) {
    console.log('bazaar-service: getAllies');
    const response = await BazaarApi.getApps(
      this.core.conduit!,
      shipName,
      shipPath,
      category
    );
    console.log(response);
    return response;
  }

  async getAllies(_event: any) {
    console.log('bazaar-service: getAllies');
    const response = await BazaarApi.getAllies(this.core.conduit!);
    console.log(response);
    return response;
  }

  async getTreaties(_event: any, shipName: string) {
    console.log('bazaar-service: getTreaties => %o', shipName);
    const response = await BazaarApi.getTreaties(this.core.conduit!, shipName);
    console.log(response);
    return response;
  }
}
