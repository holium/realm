import { ipcMain, ipcRenderer } from 'electron';
import { getSnapshot } from 'mobx-state-tree';
import { Realm } from '../../';

import { BaseService } from '../base.service';
import { DiskStore } from '../base.store';
import { CampfireStore, CampfireStoreType } from './campfire.model';

/**
 * CampfireService
 */
export class CampfireService extends BaseService {
  private db?: DiskStore; // for persistance
  private state?: CampfireStoreType; // for state management

  handlers = {
    'realm.campfire.set-view': this.setView,
  };

  static preload = {
    setView: async (view: string) => {
      return await ipcRenderer.invoke('realm.campfire.set-view', view);
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

  async load(patp: string) {
    const secretKey: string | null = this.core.passwords.getPassword(patp);
    if (!secretKey) throw new Error('No password found for this ship');
    this.db = new DiskStore('campfire', patp, secretKey, CampfireStore, {});
    this.state = this.db.model as CampfireStoreType;
    this.db.initialUpdate(this.core.onEffect);
    this.db.registerPatches(this.core.onEffect);
  }

  // ***********************************************************
  // ************************ CAMPFIRE ***************************
  // ***********************************************************

  setView(view: string) {
    this.state?.setView(view);
  }
}
