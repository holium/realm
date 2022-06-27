import { ipcMain, ipcRenderer } from 'electron';
import Store from 'electron-store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import { DesktopStoreType, DesktopStore } from './desktop.model';

/**
 * DesktopService
 */
export class SpacesService extends BaseService {
  private db: Store<DesktopStoreType>; // for persistance
  private state?: DesktopStoreType; // for state management
  handlers = {
    'realm.desktop.change-wallpaper': this.changeWallpaper,
  };

  static preload = {
    changeWallpaper: (spaceId: string, wallpaper: string) => {
      return ipcRenderer.invoke(
        'realm.desktop.change-wallpaper',
        spaceId,
        wallpaper
      );
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);
    this.db = new Store({
      name: `realm.desktop.${core.credentials?.ship}`,
      accessPropertiesByDotNotation: true,
      defaults: DesktopStore.create(),
    });

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });

    let persistedState: DesktopStoreType = this.db.store;
    this.state = DesktopStore.create(castToSnapshot(persistedState));

    onSnapshot(this.state, (snapshot) => {
      this.db.store = castToSnapshot(snapshot);
    });

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'desktop',
        response: 'patch',
      };
      this.onEffect(patchEffect);
    });
  }

  get snapshot() {
    return getSnapshot(this.state!);
  }

  changeWallpaper(_event: any, spaceId: string, wallpaper: string) {
    this.state?.setWallpaper(wallpaper);
  }
}
