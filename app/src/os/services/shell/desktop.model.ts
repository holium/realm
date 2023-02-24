import { types, applySnapshot, Instance, SnapshotIn } from 'mobx-state-tree';
import { Dimensions } from 'os/types';
import { AppType, Glob } from '../spaces/models/bazaar';
import { toJS } from 'mobx';
import {
  getMaximizedBounds,
  getInitialWindowBounds,
  isMaximizedBounds,
} from './lib/window-manager';

// Bounds are using the realm.config 1-10 scale.
const BoundsModel = types.model({
  x: types.number,
  y: types.number,
  width: types.number,
  height: types.number,
});

type BoundsModelType = Instance<typeof BoundsModel>;

const AppWindowModel = types
  .model('AppWindowModel', {
    /**
     * The `appId` is used to map the window to the corresponding app.
     */
    appId: types.identifier,
    glob: types.optional(types.boolean, false),
    href: types.maybeNull(Glob),
    title: types.optional(types.string, ''),
    zIndex: types.number,
    type: types.optional(
      types.enumeration(['urbit', 'web', 'native', 'dialog', 'dev']),
      'urbit'
    ),
    /**
     * The size and position of the window.
     */
    bounds: BoundsModel,
    /**
     * The previous size and position of the window.
     * Needed for returning from maximized/fullscreen state.
     */
    prevBounds: types.optional(BoundsModel, {
      x: 1,
      y: 1,
      width: 5,
      height: 5,
    }),
    /**
     * The active window has a titlebar with full contrast.
     */
    isActive: types.optional(types.boolean, false),
    /**
     * The visual state of the window.
     */
    state: types.optional(
      types.enumeration(['normal', 'minimized', 'fullscreen']),
      'normal'
    ),
  })
  .actions((self) => ({
    setZIndex(zIndex: number) {
      self.zIndex = zIndex;
    },
    normal() {
      self.state = 'normal';
    },
    minimize() {
      self.state = 'minimized';
    },
    maximize(desktopDimensions: Dimensions) {
      const isMaximized = isMaximizedBounds(self.bounds, desktopDimensions);
      if (isMaximized) {
        self.bounds = { ...self.prevBounds };
      } else {
        self.prevBounds = { ...self.bounds };
        self.bounds = getMaximizedBounds(desktopDimensions);
      }
    },
    setIsActive(isActive: boolean) {
      self.isActive = isActive;
    },
  }))
  .views((self) => ({
    get isMinimized() {
      return self.state === 'minimized';
    },
  }));

export interface AppWindowType extends Instance<typeof AppWindowModel> {}
export interface AppWindowProps extends SnapshotIn<typeof AppWindowModel> {}

export const DesktopStore = types
  .model('DesktopStore', {
    windows: types.map(AppWindowModel),
    mouseColor: types.optional(types.string, '#4E9EFD'),
    homePaneOpen: types.optional(types.boolean, false),
    isolationMode: types.optional(types.boolean, false),
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
    get isIsolationMode() {
      return self.isolationMode;
    },
    getWindowByAppId(appId: string) {
      return self.windows.get(appId);
    },
  }))
  .actions((self) => ({
    setMouseColor(color: string) {
      self.mouseColor = color;
    },
    openHomePane() {
      self.homePaneOpen = true;
    },
    closeHomePane() {
      self.homePaneOpen = false;
    },
    toggleIsolationMode() {
      self.isolationMode = !self.isolationMode;
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
    openWindow(app: AppType, desktopDimensions: Dimensions) {
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
        bounds: getInitialWindowBounds(app, desktopDimensions),
      });

      self.windows.set(newWindow.appId, newWindow);
      this.setActive(newWindow.appId);
      if (self.homePaneOpen) self.homePaneOpen = false;

      return newWindow;
    },
    openDialog(windowProps: AppWindowProps) {
      const newWindow = AppWindowModel.create(windowProps);

      return newWindow;
    },
    toggleMinimize(appId: string) {
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
    toggleMaximize(appId: string, desktopDimensions: Dimensions) {
      const window = self.getWindowByAppId(appId);
      if (!window) return console.error('Window not found');

      window.maximize(desktopDimensions);

      return toJS(window.bounds);
    },
    closeWindow(appId: string) {
      const windows = Array.from(self.windows.values());
      const activeWindow = windows.find((app: AppWindowType) => app.isActive);
      if (activeWindow?.appId === appId) {
        const nextWindow = windows.filter(
          (app: AppWindowType) => !app.isMinimized
        )[0];
        if (nextWindow) {
          this.setActive(nextWindow.appId);
        }
      }
      self.windows.delete(appId);
    },
  }));

export type DesktopStoreType = Instance<typeof DesktopStore>;
