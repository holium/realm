import { types, Instance, getSnapshot, applySnapshot } from 'mobx-state-tree';
import {
  AppWindowMobxType,
  AppWindowModel,
  AppWindowProps,
  BoundsModelType,
} from './window.model';
import { getInitialWindowBounds } from '../lib/window-manager';
import { AppType } from './bazaar.model';
import { toJS } from 'mobx';

export const ShellModel = types
  .model('ShellModel', {
    isBlurred: types.optional(types.boolean, true),
    isFullscreen: types.optional(types.boolean, true),
    desktopDimensions: types.optional(
      types.model({
        width: types.number,
        height: types.number,
      }),
      { width: 0, height: 0 }
    ),
    dialogId: types.maybe(types.string),
    dialogProps: types.map(types.string),
    mouseColor: types.optional(types.string, '#4E9EFD'),
    homePaneOpen: types.optional(types.boolean, false),
    isolationMode: types.optional(types.boolean, false),
    micAllowed: types.optional(types.boolean, false),
    multiplayerEnabled: types.optional(types.boolean, false),
    windows: types.map(AppWindowModel),
  })
  .views((self) => ({
    get hasOpenWindow() {
      return self.windows.size > 0;
    },
    get openWindows() {
      return Array.from(self.windows.values());
    },
    getWindowByAppId(appId: string) {
      return self.windows.get(appId);
    },
    get isHomePaneOpen() {
      return self.homePaneOpen;
    },
    get isIsolationMode() {
      return self.isolationMode;
    },
  }))
  .actions((self) => ({
    openDialogWindow(windowProps: AppWindowProps) {
      const newWindow = AppWindowModel.create(windowProps);
      return newWindow;
    },
    openDialog(dialogId: string) {
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
      // TODO set color in ship profile
      window.electron.app.setMouseColor(mouseColor);
      self.mouseColor = mouseColor;
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
      self.isBlurred = isBlurred;
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
    openWindow(app: AppType) {
      let glob;
      let href;
      if (app.type === 'urbit') {
        glob = app.href.glob ? true : false;
        href = app.href;
      }

      if (app.type === 'dev') {
        // app as DevApp
        href = { site: app.web.url };
      }
      const newWindow = AppWindowModel.create({
        appId: app.id,
        title: app.title,
        glob,
        href,
        state: 'normal',
        zIndex: self.windows.size + 1,
        type: app.type,
        bounds: getInitialWindowBounds(app, self.desktopDimensions),
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
      window.maximize(self.desktopDimensions);
      return toJS(window.bounds);
    },
    toggleDevTools() {
      return window.electron.app.toggleDevTools();
    },
    closeWindow(appId: string) {
      const windows = Array.from(self.windows.values());
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
