import { theme } from './../../../renderer/theme';
import { ThemeModelType } from './../theme.model';
import { ipcMain, session, ipcRenderer } from 'electron';
import Store from 'electron-store';
import { toJS } from 'mobx';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
  clone,
  cast,
} from 'mobx-state-tree';
import { rgba } from 'polished';

import Realm from '../..';
import { BaseService } from '../base.service';
import { DesktopStoreType, DesktopStore } from './desktop.model';

/**
 * DesktopService
 *
 * Preferences
 *  - desktop
 *    - isolation-mode: boolean
 *    - window-manager: "calm", "classic"
 *  - mouse
 *    - cursor-type: "system", "realm"
 *    - use-profile-color: boolean
 *  - theme
 *    - appearance: "light" | "dark" | "wallpaper"
 *    - colors: "default" | "wallpaper-derived" | <hex value>
 *    - font: "default" | "custom"
 *      - google-font: "philosopher"
 */
export class DesktopService extends BaseService {
  private db?: Store<DesktopStoreType>; // for persistance
  private state: DesktopStoreType; // for state management
  handlers = {
    'realm.desktop.change-wallpaper': this.changeWallpaper,
    'realm.desktop.set-active': this.setActive,
    'realm.desktop.set-home-pane': this.setHomePane,
    'realm.desktop.set-app-dimensions': this.setAppDimensions,
    'realm.desktop.set-mouse-color': this.setMouseColor,
    // 'realm.desktop.set-fullscreen': this.setFullscreen,
    'realm.desktop.open-app-window': this.openAppWindow,
    'realm.desktop.close-app-window': this.closeAppWindow,
  };

  static preload = {
    changeWallpaper: async (spaceId: string, theme: ThemeModelType) => {
      return ipcRenderer.invoke(
        'realm.desktop.change-wallpaper',
        spaceId,
        theme
      );
    },
    setHomePane: (isHome: boolean) => {
      return ipcRenderer.invoke('realm.desktop.set-home-pane', isHome);
    },
    setActive: (spaceId: string, appId: string) => {
      return ipcRenderer.invoke('realm.desktop.set-active', spaceId, appId);
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
    setMouseColor: (mouseColor: string) => {
      return ipcRenderer.invoke('realm.desktop.set-mouse-color', mouseColor);
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

    this.state = DesktopStore.create({});
    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  async load(patp: string, mouseColor: string) {
    // const syncEffect = {
    //   model: getSnapshot(this.state!),
    //   resource: 'desktop',
    //   key: null,
    //   response: 'initial',
    // };
    // this.core.onEffect(syncEffect);

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'desktop',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });

    this.state.setMouseColor(mouseColor);
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async changeWallpaper(_event: any, spaceId: string, theme: any) {
    this.core.services.spaces.setSpaceWallpaper(spaceId, theme);
    this.core.services.shell.closeDialog(null);

    // const isHomeSpace : boolean = (spaceId === `/${this.core.conduit!.ship}/our`);
    // if (newTheme) {
    //   this.state?.setTheme(newTheme!);
    // }

    return;
  }

  setActive(_event: any, spaceId: string, appId: string) {
    this.state?.setActive(appId);
  }
  setHomePane(_event: any, isHome: boolean) {
    this.state?.setHomePane(isHome);
    this.core.services.shell.setBlur(null, isHome);
  }

  setMouseColor(_event: any, mouseColor: string) {
    this.state?.setMouseColor(mouseColor);
  }
  setAppDimensions(
    _event: any,
    windowId: any,
    dimensions: { width: number; height: number; x: number; y: number }
  ) {
    this.state?.setDimensions(windowId, dimensions);
  }
  openAppWindow(_event: any, spaceId: string, selectedApp: any) {
    let { desktopDimensions, isFullscreen } = this.core.services.shell;

    const newWindow = this.state!.openBrowserWindow(
      selectedApp,
      desktopDimensions as any,
      isFullscreen as boolean
    );
    this.core.services.shell.setBlur(null, false);
    const credentials = this.core.credentials!;

    if (selectedApp.type === 'urbit') {
      const appUrl = newWindow.href?.glob
        ? `${credentials.url}/apps/${selectedApp.id!}`
        : `${credentials.url}${newWindow.href?.site}`;
      // console.log('core credentials => %o', credentials);
      // Hit the main process handler for setting partition cookies
      // console.log('setting cookies => %o', {
      //   url: appUrl,
      //   name: `urbauth-${credentials.ship}`,
      //   value: credentials.cookie!.split('=')[1].split('; ')[0],
      // });
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
