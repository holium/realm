import { toJS } from 'mobx';
import { applySnapshot, getSnapshot, Instance, types } from 'mobx-state-tree';

import { Bookmark } from 'os/services/ship/spaces/tables/bookmarks.table';
import { getDefaultAppDimensions } from 'renderer/lib/dimensions';

import {
  getCenteredPosition,
  getInitialWindowBounds,
} from '../../lib/window-manager';
import { shipStore } from '../ship.store';
import { AppMobxType } from './bazaar.model';
import {
  AppWindowMobxType,
  AppWindowModel,
  AppWindowProps,
  BoundsModelType,
} from './window.model';

export const NativeAppConfig = types.model('NativeAppConfig', {
  route: types.string,
});

export type NativeAppConfigMobxType = Instance<typeof NativeAppConfig>;

export const ShellModel = types
  .model('ShellModel', {
    isBlurred: types.optional(types.boolean, true),
    snapView: types.optional(types.string, 'none'),
    isFullscreen: types.optional(types.boolean, true),
    isStandaloneChat: types.optional(types.boolean, false),
    desktopDimensions: types.optional(
      types.model({
        width: types.number,
        height: types.number,
      }),
      { width: 0, height: 0 }
    ),
    dialogId: types.maybe(types.string),
    dialogProps: types.map(types.string),
    homePaneOpen: types.optional(types.boolean, false),
    micAllowed: types.optional(types.boolean, false),
    multiplayerEnabled: types.optional(types.boolean, false),
    windows: types.map(AppWindowModel),
    nativeConfig: types.map(NativeAppConfig),
  })
  .views((self) => ({
    get hasOpenWindow() {
      return self.windows.size > 0;
    },
    get openWindows() {
      return Array.from(self.windows.values());
    },
    get isHomePaneOpen() {
      return self.homePaneOpen;
    },
    getWindowByAppId(appId: string) {
      return self.windows.get(appId);
    },
    isWindowFullyMaximized(appId: string) {
      const window = self.windows.get(appId);
      if (!window) throw console.error('Window not found');
      return window.isFullyMaximized(self.desktopDimensions);
    },
  }))
  .actions((self) => ({
    openDialogWindow(windowProps: AppWindowProps) {
      const newWindow = AppWindowModel.create(windowProps);
      return newWindow;
    },
    openDialog(dialogId: string) {
      self.homePaneOpen = false;
      self.dialogId = dialogId;
    },
    openDialogWithStringProps(dialogId: string, props: any) {
      self.dialogId = dialogId;
      applySnapshot(
        self.dialogProps,
        getSnapshot(types.map(types.string).create(props))
      );
    },
    closeDialog() {
      self.dialogId = undefined;
    },
    setMouseColor: async (mouseColor: string) => {
      window.electron.app.setMouseColor(mouseColor);
    },
    setStandaloneChat: (isStandaloneChat: boolean) => {
      window.electron.app.setStandaloneChat(isStandaloneChat);
      self.isStandaloneChat = isStandaloneChat;
    },
    setFullScreen: (isFullscreen: boolean) => {
      window.electron.app.setFullscreen(isFullscreen);
      self.isFullscreen = isFullscreen;
    },
    enableIsolationMode: () => {
      return window.electron.app.enableIsolationMode();
    },
    disableIsolationMode: () => {
      return window.electron.app.disableIsolationMode();
    },
    setDesktopDimensions(width: number, height: number) {
      self.desktopDimensions = {
        width,
        height,
      };
    },
    setIsBlurred(isBlurred: boolean) {
      /* don't remove blur if home pane is open */
      if (self.isBlurred && self.homePaneOpen) {
        return;
      }
      self.isBlurred = isBlurred;
    },
    setSnapView(view: string) {
      self.snapView = view;
    },
    hideSnapView() {
      self.snapView = 'none';
    },
    setFullscreen(isFullscreen: boolean) {
      self.isFullscreen = isFullscreen;
    },
    openHomePane() {
      self.homePaneOpen = true;
    },
    closeHomePane() {
      self.homePaneOpen = false;
    },
    setActive(appId: string) {
      self.windows.forEach((win) => {
        if (appId === win.appId) {
          win.setZIndex(self.windows.size + 1);
        } else {
          if (win.zIndex > 1) {
            win.setZIndex(win.zIndex - 1);
          }
        }
      });
      self.windows.forEach((window) => {
        window.setIsActive(window.appId === appId);
      });
    },
    setInactive(appId: string) {
      const window = self.getWindowByAppId(appId);
      if (!window) return console.error('Window not found');

      window.setIsActive(false);
    },
    setBounds(appId: string, bounds: BoundsModelType) {
      const windowBounds = self.getWindowByAppId(appId)?.bounds;
      if (windowBounds) applySnapshot(windowBounds, bounds);
    },
    openWindow(app: AppMobxType, nativeConfig?: any) {
      let glob;
      let href;
      if (app.type === 'urbit') {
        // @ts-ignore
        glob = app.href?.glob ? true : false;
        href = app.href;
      }

      // @ts-ignore
      if (app.type === 'dev') {
        // @ts-ignore
        href = { site: app.web.url };
      }

      if (app.type === 'native' && nativeConfig) {
        self.nativeConfig.set(app.id, nativeConfig);
      }

      const bounds = getInitialWindowBounds(app, self.desktopDimensions);
      const newWindow = AppWindowModel.create({
        appId: app.id,
        title: app.title,
        glob: glob,
        href: toJS(href),
        state: 'normal',
        zIndex: self.windows.size + 1,
        type: app.type,
        bounds,
      });

      shipStore.bazaarStore.addRecentApp(app.id);

      self.windows.set(newWindow.appId, newWindow);
      this.setActive(newWindow.appId);
      if (self.homePaneOpen) self.homePaneOpen = false;

      return newWindow;
    },
    openBookmark(bookmark: Omit<Bookmark, 'favicon'>) {
      const dimensions = getDefaultAppDimensions(
        'os-browser',
        self.desktopDimensions
      );
      if (!dimensions) {
        console.error('Could not get default dimensions');
        return;
      }
      const position = getCenteredPosition(dimensions);

      const newWindow = AppWindowModel.create({
        appId: bookmark.url,
        title: bookmark.title,
        glob: false,
        state: 'normal',
        type: 'web',
        href: {
          site: bookmark.url,
        },
        zIndex: self.windows.size + 1,
        bounds: {
          ...dimensions,
          ...position,
        },
      });

      self.windows.set(newWindow.appId, newWindow);
      this.setActive(newWindow.appId);
      if (self.homePaneOpen) self.homePaneOpen = false;

      return newWindow;
    },
    setWindowBounds(appId: string, bounds: BoundsModelType) {
      const windowBounds = self.getWindowByAppId(appId)?.bounds;
      if (windowBounds) applySnapshot(windowBounds, bounds);
    },
    toggleMinimized(appId: string) {
      const window = self.getWindowByAppId(appId);
      if (!window) return console.error('Window not found');

      if (window.isMinimized) {
        window.normal();
        this.setActive(appId);
      } else {
        window.minimize();
        this.setInactive(appId);
      }
    },
    toggleMaximized(appId: string): BoundsModelType {
      const window = self.getWindowByAppId(appId);
      if (!window) throw console.error('Window not found');
      window.toggleFullyMaximize(self.desktopDimensions);
      window.isMaximized = !window.isMaximized;
      return toJS(window.bounds);
    },
    maximizeLeft(appId: string): BoundsModelType {
      const window = self.getWindowByAppId(appId);
      if (!window) throw console.error('Window not found');
      window.maximizeLeft(self.desktopDimensions);
      window.isMaximized = true;
      return toJS(window.bounds);
    },
    maximizeRight(appId: string): BoundsModelType {
      const window = self.getWindowByAppId(appId);
      if (!window) throw console.error('Window not found');
      window.maximizeRight(self.desktopDimensions);
      window.isMaximized = true;
      return toJS(window.bounds);
    },
    maximize(appId: string): BoundsModelType {
      const window = self.getWindowByAppId(appId);
      if (!window) throw console.error('Window not found');
      if (!self.isWindowFullyMaximized(appId)) {
        window.toggleFullyMaximize(self.desktopDimensions);
        window.isMaximized = true;
      }
      return toJS(window.bounds);
    },
    unmaximize(appId: string): {
      bounds: BoundsModelType;
      prevBounds: BoundsModelType;
    } {
      const window = self.getWindowByAppId(appId);
      if (!window) throw console.error('Window not found');
      if (self.windows.get(appId)?.isMaximized) {
        window.toggleMaximize(self.desktopDimensions);
        window.isMaximized = false;
      }
      return {
        bounds: toJS(window.bounds),
        prevBounds: toJS(window.prevBounds),
      };
    },
    toggleDevTools() {
      return window.electron.app.toggleDevTools();
    },
    closeWindow(appId: string) {
      const windows = Array.from(self.windows.values());
      self.nativeConfig.delete(appId);
      const activeWindow = windows.find(
        (app: AppWindowMobxType) => app.isActive
      );
      if (activeWindow?.appId === appId) {
        const nextWindow = windows.filter(
          (app: AppWindowMobxType) => !app.isMinimized
        )[0];
        if (nextWindow) {
          this.setActive(nextWindow.appId);
        }
      }
      self.windows.delete(appId);
    },
    setMicAllowed(isAllowed: boolean) {
      self.micAllowed = isAllowed;
    },
    toggleMultiplayer() {
      self.multiplayerEnabled = !self.multiplayerEnabled;
    },
  }));

export type ShellModelType = Instance<typeof ShellModel>;
