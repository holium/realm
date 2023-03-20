import { ipcMain, IpcMainInvokeEvent, ipcRenderer } from 'electron';
import { getSnapshot, onPatch } from 'mobx-state-tree';
import { Realm } from '../../';

import { BaseService } from '../base.service';
import { CampfireStore, CampfireStoreType } from './campfire.model';

/**
 * CampfireService
 */
export class CampfireService extends BaseService {
  private readonly state: CampfireStoreType; // for state management

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

    this.state = CampfireStore.create({});
    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async load() {
    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'campfire',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });
  }

  // ***********************************************************
  // ************************ CAMPFIRE ***************************
  // ***********************************************************

  setView(_event: IpcMainInvokeEvent, view: string) {
    this.state?.setView(view);
  }
}
