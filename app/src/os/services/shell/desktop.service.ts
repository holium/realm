import { ipcMain, session, ipcRenderer } from 'electron';
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
export class DesktopService extends BaseService {
  private db: Store<DesktopStoreType>; // for persistance
  private state?: DesktopStoreType; // for state management
  handlers = {
    'realm.desktop.change-wallpaper': this.changeWallpaper,
    'realm.desktop.set-active': this.setActive,
    'realm.desktop.set-desktop-dimensions': this.setDesktopDimensions,
    'realm.desktop.set-app-dimensions': this.setAppDimensions,
    'realm.desktop.open-app-window': this.openAppWindow,
    'realm.desktop.close-app-window': this.closeAppWindow,
  };

  static preload = {
    changeWallpaper: (spaceId: string, wallpaper: string) => {
      return ipcRenderer.invoke(
        'realm.desktop.change-wallpaper',
        spaceId,
        wallpaper
      );
    },
    setActive: (spaceId: string, appId: string) => {
      return ipcRenderer.invoke('realm.desktop.set-active', spaceId, appId);
    },
    setDesktopDimensions: (width: number, height: number) => {
      return ipcRenderer.invoke(
        'realm.desktop.set-desktop-dimensions',
        width,
        height
      );
    },
    setAppDimensions: (
      windowId: any,
      dimensions: { width: number; height: number; x: number; y: number }
    ) => {
      return ipcRenderer.invoke(
        'realm.desktop.set-app-dimensions',
        windowId,
        dimensions
      );
    },
    openAppWindow: (spaceId: string, app: any) => {
      return ipcRenderer.invoke('realm.desktop.open-app-window', spaceId, app);
    },
    closeAppWindow: (spaceId: string, app: any) => {
      return ipcRenderer.invoke('realm.desktop.close-app-window', spaceId, app);
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);
    this.db = new Store({
      name: `realm.desktop.${core.credentials?.ship}`,
      accessPropertiesByDotNotation: true,
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
      this.core.onEffect(patchEffect);
    });
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  changeWallpaper(_event: any, spaceId: string, wallpaper: string) {
    this.state?.setWallpaper(wallpaper);
  }

  setActive(_event: any, spaceId: string, appId: string) {
    this.state?.setActive(appId);
    // this.state?.activeWindow =
  }
  setDesktopDimensions(_event: any, width: number, height: number) {
    this.state?.setDesktopDimensions(width, height);
  }
  setAppDimensions(
    _event: any,
    windowId: any,
    dimensions: { width: number; height: number; x: number; y: number }
  ) {
    this.state?.setDimensions(windowId, dimensions);
  }
  openAppWindow(_event: any, spaceId: string, selectedApp: any) {
    this.state?.openBrowserWindow(selectedApp);
    const credentials = this.core.credentials!;

    if (
      selectedApp.type === 'urbit' ||
      (selectedApp.type === 'web' && !selectedApp.web.development)
    ) {
      const appUrl = `${credentials.url}/apps/${selectedApp.id!}`;
      // Hit the main process handler for setting partition cookies
      session.fromPartition(`${selectedApp.type}-webview`).cookies.set({
        url: appUrl,
        name: `urbauth-${credentials.ship}`,
        value: credentials.cookie!.split('=')[1].split('; ')[0],
      });
    }
  }
  closeAppWindow(_event: any, spaceId: string, selectedApp: any) {
    this.state?.closeBrowserWindow(selectedApp.id);
  }
}
