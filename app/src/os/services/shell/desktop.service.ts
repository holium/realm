import { ThemeModelType } from './../theme.model';
import { ipcMain, session, ipcRenderer } from 'electron';
import { onPatch, getSnapshot } from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import { DesktopStoreType, DesktopStore } from './desktop.model';
import { AppType } from '../spaces/models/bazaar';
import { IpcRendererEvent } from 'electron/renderer';

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
  private readonly state: DesktopStoreType; // for state management
  handlers = {
    'realm.desktop.change-wallpaper': this.changeWallpaper,
    'realm.desktop.set-active': this.setActive,
    'realm.desktop.open-home-pane': this.openHomePane,
    'realm.desktop.close-home-pane': this.closeHomePane,
    'realm.desktop.set-app-dimensions': this.setAppDimensions,
    'realm.desktop.set-mouse-color': this.setMouseColor,
    // 'realm.desktop.set-fullscreen': this.setFullscreen,
    'realm.desktop.open-app-window': this.openAppWindow,
    'realm.desktop.toggle-minimized': this.toggleMinimized,
    'realm.desktop.close-app-window': this.closeAppWindow,
  };

  static preload = {
    changeWallpaper: async (spaceId: string, theme: ThemeModelType) => {
      return await ipcRenderer.invoke(
        'realm.desktop.change-wallpaper',
        spaceId,
        theme
      );
    },
    openHomePane: async () => {
      return await ipcRenderer.invoke('realm.desktop.open-home-pane');
    },
    closeHomePane: async () => {
      return await ipcRenderer.invoke('realm.desktop.close-home-pane');
    },
    setActive: async (spaceId: string, appId: string) => {
      return await ipcRenderer.invoke(
        'realm.desktop.set-active',
        spaceId,
        appId
      );
    },
    setAppDimensions: async (
      windowId: any,
      dimensions: { width: number; height: number; x: number; y: number }
    ) => {
      return await ipcRenderer.invoke(
        'realm.desktop.set-app-dimensions',
        windowId,
        dimensions
      );
    },
    setMouseColor: async (mouseColor: string) => {
      return await ipcRenderer.invoke(
        'realm.desktop.set-mouse-color',
        mouseColor
      );
    },

    openAppWindow: async (spaceId: string, app: any) => {
      return await ipcRenderer.invoke(
        'realm.desktop.open-app-window',
        spaceId,
        app
      );
    },
    toggleMinimized: async (spaceId: string, windowId: string) => {
      return await ipcRenderer.invoke(
        'realm.desktop.toggle-minimized',
        spaceId,
        windowId
      );
    },
    closeAppWindow: async (spaceId: string, app: any) => {
      return await ipcRenderer.invoke(
        'realm.desktop.close-app-window',
        spaceId,
        app
      );
    },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    this.state = DesktopStore.create({});
    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-expect-error
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  async load(_patp: string, mouseColor: string) {
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
  }

  setActive(_event: any, _spaceId: string, appId: string) {
    this.state?.setActive(appId);
  }

  openHomePane(event: IpcRendererEvent) {
    this.state.openHomePane();
    this.core.services.shell.setBlur(event, true);
  }

  closeHomePane(event: IpcRendererEvent) {
    this.state.closeHomePane();
    this.core.services.shell.setBlur(event, false);
  }

  setMouseColor(_event: any, mouseColor: string) {
    this.state?.setMouseColor(mouseColor);
  }

  setAppDimensions(
    _event: any,
    windowId: any,
    dimensions: { width: number; height: number; x: number; y: number }
  ) {
    this.state?.setBounds(windowId, dimensions);
  }

  openAppWindow(_event: any, _spaceId: string, selectedApp: AppType) {
    const { desktopDimensions } = this.core.services.shell;

    const newWindow = this.state.openWindow(
      selectedApp,
      desktopDimensions as any
    );
    this.core.services.shell.setBlur(null, false);
    const credentials = this.core.credentials!;

    if (selectedApp.type === 'urbit') {
      const appUrl = newWindow.href?.glob
        ? `${credentials.url}/apps/${selectedApp.id!}`
        : `${credentials.url}${newWindow.href?.site}`;

      session.fromPartition(`${selectedApp.type}-webview`).cookies.set({
        url: appUrl,
        name: `urbauth-${credentials.ship}`,
        value: credentials.cookie?.split('=')[1].split('; ')[0],
      });
    } else if (selectedApp.type === 'dev') {
      const appUrl = selectedApp.web.url;
      // Hit the main process handler for setting partition cookies
      session.fromPartition(`${selectedApp.id}-web-webview`).cookies.set({
        url: appUrl,
        name: `urbauth-${credentials.ship}`,
        value: credentials.cookie!.split('=')[1].split('; ')[0],
      });
    }
  }

  toggleMinimized(_event: any, _spaceId: string, windowId: string) {
    this.state?.toggleMinimize(windowId);
  }
  closeAppWindow(_event: any, _spaceId: string, selectedApp: any) {
    this.state?.closeWindow(selectedApp.id);
  }
}
