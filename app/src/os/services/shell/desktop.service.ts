import { ipcMain, session, ipcRenderer } from 'electron';
import Store from 'electron-store';
import { toJS } from 'mobx';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
  applySnapshot,
  clone,
  cast,
} from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import { DesktopStoreType, DesktopStore } from './desktop.model';
import { ThemeModelType } from './theme.model';

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
  private state?: DesktopStoreType; // for state management
  handlers = {
    'realm.desktop.change-wallpaper': this.changeWallpaper,
    'realm.desktop.set-active': this.setActive,
    'realm.desktop.set-desktop-dimensions': this.setDesktopDimensions,
    'realm.desktop.set-blur': this.setBlur,
    'realm.desktop.set-home-pane': this.setHomePane,
    'realm.desktop.set-app-dimensions': this.setAppDimensions,
    'realm.desktop.set-mouse-color': this.setMouseColor,
    'realm.desktop.set-theme': this.setTheme,
    'realm.desktop.open-app-window': this.openAppWindow,
    'realm.desktop.close-app-window': this.closeAppWindow,
    'realm.desktop.open-dialog': this.openDialog,
    'realm.desktop.close-dialog': this.closeDialog,
    'realm.desktop.next-dialog': this.nextDialog,
    'realm.desktop.previous-dialog': this.previousDialog,
  };

  static preload = {
    changeWallpaper: async (
      spaceId: string,
      color: string,
      wallpaper: string
    ) => {
      return ipcRenderer.invoke(
        'realm.desktop.change-wallpaper',
        spaceId,
        color,
        wallpaper
      );
    },
    setBlur: (blurred: boolean) => {
      return ipcRenderer.invoke('realm.desktop.set-blur', blurred);
    },
    setHomePane: (isHome: boolean) => {
      return ipcRenderer.invoke('realm.desktop.set-home-pane', isHome);
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
    setMouseColor: (mouseColor: string) => {
      return ipcRenderer.invoke('realm.desktop.set-mouse-color', mouseColor);
    },
    setTheme: (theme: ThemeModelType) => {
      return ipcRenderer.invoke('realm.desktop.set-theme', theme);
    },
    openAppWindow: (spaceId: string, app: any) => {
      return ipcRenderer.invoke('realm.desktop.open-app-window', spaceId, app);
    },
    closeAppWindow: (spaceId: string, app: any) => {
      return ipcRenderer.invoke('realm.desktop.close-app-window', spaceId, app);
    },
    openDialog: (dialogId: string) => {
      return ipcRenderer.invoke('realm.desktop.open-dialog', dialogId);
    },
    nextDialog: (dialogId: string) => {
      return ipcRenderer.invoke('realm.desktop.next-dialog', dialogId);
    },
    previousDialog: (dialogId: string) => {
      return ipcRenderer.invoke('realm.desktop.next-dialog', dialogId);
    },
    closeDialog: () => {
      return ipcRenderer.invoke('realm.desktop.close-dialog');
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  async load(patp: string, mouseColor: string) {
    this.db = new Store({
      name: `realm.desktop.${patp}`,
      accessPropertiesByDotNotation: true,
    });

    let persistedState: DesktopStoreType = this.db.store;
    this.state = DesktopStore.create(castToSnapshot(persistedState));

    onSnapshot(this.state, (snapshot) => {
      this.db!.store = castToSnapshot(snapshot);
    });

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

  openDialog(_event: any, dialogId: string) {
    this.state?.closeDialog(); // must close old dialogs first
    this.state?.openDialog(dialogId);
  }

  nextDialog(_event: any, dialogId: string) {
    this.state?.openDialog(dialogId);
  }

  previousDialog(_event: any, dialogId: string) {
    this.state?.openDialog(dialogId);
  }

  closeDialog(_event: any) {
    this.state?.closeDialog();
  }
  async changeWallpaper(
    _event: any,
    spaceId: string,
    color: string,
    wallpaper: string
  ) {
    const newTheme = await this.core.services.spaces.setSpaceWallpaper(
      spaceId,
      color,
      wallpaper
    );
    this.state?.closeDialog();
    newTheme && this.state?.setTheme(cast(newTheme)!);
    return toJS(newTheme);
  }

  setActive(_event: any, spaceId: string, appId: string) {
    this.state?.setActive(appId);
    // this.state?.activeWindow =
  }
  setHomePane(_event: any, isHome: boolean) {
    this.state?.setHomePane(isHome);
    this.state?.setIsBlurred(isHome);
  }
  setBlur(_event: any, blurred: boolean) {
    this.state?.setIsBlurred(blurred);
  }

  setMouseColor(_event: any, mouseColor: string) {
    this.state?.setMouseColor(mouseColor);
  }
  setTheme(theme: ThemeModelType) {
    this.state?.setTheme(clone(theme)!);
    // if (this.state?.theme.wallpaper !== theme.wallpaper) {
    // }
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
