// import { osState, shipState } from './../store';
import { types, applySnapshot, Instance } from 'mobx-state-tree';
import { getInitialWindowDimensions } from './lib/window-manager';
import { Glob } from '../ship/models/docket';
import { AppType } from '../spaces/models/bazaar';

const DimensionsModel = types.model({
  x: types.number,
  y: types.number,
  width: types.number,
  height: types.number,
});

type DimensionModelType = Instance<typeof DimensionsModel>;

const Window = types
  .model('WindowModel', {
    id: types.identifier,
    glob: types.optional(types.boolean, false),
    href: types.maybeNull(Glob),
    title: types.optional(types.string, ''),
    zIndex: types.number,
    type: types.optional(
      types.enumeration(['urbit', 'web', 'native', 'dialog', 'dev']),
      'urbit'
    ),
    dimensions: DimensionsModel,
    minimized: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    setZIndex(newZ: number) {
      self.zIndex = newZ;
    },
  }));

export type WindowModelType = Instance<typeof Window>;
export interface WindowModelProps {
  id: string;
  title?: string;
  glob?: boolean;
  href?: { site: string; glob: any };
  zIndex: number;
  type: 'urbit' | 'web' | 'native' | 'dialog' | 'dev';
  dimensions: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  minimized?: boolean;
}

export const DesktopStore = types
  .model('DesktopStore', {
    showHomePane: types.optional(types.boolean, false),
    appviewPreload: types.maybe(types.string),
    dynamicMouse: types.optional(types.boolean, true),
    mouseColor: types.optional(types.string, '#4E9EFD'),
    activeWindow: types.safeReference(Window),
    windows: types.map(Window),
  })
  .views((self) => ({
    get currentOrder() {
      return self.windows.size + 1;
    },
    get hasOpenWindow() {
      return self.activeWindow !== undefined;
    },
    get openApps() {
      return Array.from(self.windows.values());
    },
    get openAppIds() {
      return Array.from(self.windows.values()).map((window: any) => window.id);
    },
    isOpenWindow(appId: string) {
      return (
        Array.from(self.windows.values()).findIndex(
          (appWindow: any) => appWindow.id === appId
        ) > -1
      );
    },
    isActiveWindow(appId: string) {
      return self.activeWindow?.id === appId;
    },
    isMinimized(appId: string) {
      return self.windows.get(appId)?.minimized;
    },
  }))
  .actions((self) => ({
    setMouseColor(newMouseColor: string = '#4E9EFD') {
      self.mouseColor = newMouseColor;
    },
    setHomePane(isHome: boolean) {
      self.showHomePane = isHome;
    },
    setActive(activeWindowId: string) {
      self.windows.forEach((win: WindowModelType) => {
        if (activeWindowId === win.id) {
          win.setZIndex(self.windows.size + 1);
        } else {
          if (win.zIndex > 1) {
            win.setZIndex(win.zIndex - 1);
          }
        }
      });
      self.activeWindow = self.windows.get(activeWindowId);
    },
    setAppviewPreload(preloadPath: string) {
      self.appviewPreload = preloadPath;
    },
    setDimensions(windowId: string, dimensions: DimensionModelType) {
      const windowDimensions = self.windows.get(windowId)?.dimensions;
      windowDimensions && applySnapshot(windowDimensions, dimensions);
    },
    openBrowserWindow(
      app: AppType,
      desktopDimensions: { width: number; height: number },
      isFullscreen: boolean
    ) {
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
      const newWindow = Window.create({
        id: app.id,
        title: app.title,
        glob,
        href,
        zIndex: self.windows.size + 1,
        type: app.type,
        dimensions: getInitialWindowDimensions(
          app,
          desktopDimensions,
          isFullscreen
        ),
      });
      self.windows.set(newWindow.id, newWindow);
      self.activeWindow = self.windows.get(newWindow.id);
      if (self.showHomePane) {
        self.showHomePane = false;
      }
      return newWindow;
    },
    toggleMinimize(windowId: string) {
      const window = self.windows.get(windowId);
      if (!window) {
        return console.error('Window not found');
      }
      if (window) {
        window.minimized = !window.minimized;
        if (window.minimized) {
          self.activeWindow?.id === windowId && (self.activeWindow = undefined);
        } else {
          self.activeWindow = window;
        }
        self.windows.set(windowId, window);
      }
    },
    closeBrowserWindow(appId: any) {
      if (self.activeWindow?.id === appId) {
        const nextWindow = Array.from(self.windows.values()).filter(
          (app: WindowModelType) => !app.minimized
        )[0];
        if (nextWindow) {
          this.setActive(nextWindow.id);
        }
      }
      self.windows.delete(appId);
    },
  }));
export type DesktopStoreType = Instance<typeof DesktopStore>;
