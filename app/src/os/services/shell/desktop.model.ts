// import { osState, shipState } from './../store';
import { types, applySnapshot, Instance, clone } from 'mobx-state-tree';
import { toJS } from 'mobx';
// import { setPartitionCookies } from './api';
import { getInitialWindowDimensions } from './lib/window-manager';
import { NativeAppList } from 'renderer/apps';
import { ThemeModel, ThemeModelType } from './theme.model';
import { rgba } from 'polished';

// const Grid = types.model({
//   width: types.enumeration(['1', '2', '3']),
//   height: types.enumeration(['1', '2']),
// });

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
    title: types.optional(types.string, ''),
    zIndex: types.number,
    type: types.optional(
      types.enumeration(['urbit', 'web', 'native', 'dialog']),
      'urbit'
    ),
    dimensions: DimensionsModel,
  })
  .actions((self) => ({
    setZIndex(newZ: number) {
      self.zIndex = newZ;
    },
  }));

export type WindowModelType = Instance<typeof Window>;
export type WindowModelProps = {
  id: string;
  title?: string;
  glob?: boolean;
  zIndex: number;
  type: 'urbit' | 'web' | 'native' | 'dialog';
  dimensions: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export const DesktopStore = types
  .model('DesktopStore', {
    showHomePane: types.optional(types.boolean, false),
    appviewPreload: types.maybe(types.string),
    dynamicMouse: types.optional(types.boolean, true),
    mouseColor: types.optional(types.string, '#4E9EFD'),
    theme: types.optional(ThemeModel, {
      wallpaper:
        'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100',
      backgroundColor: '#c2b4b4',
      dockColor: '#f0ecec',
      windowColor: '#f0ecec',
      mode: 'light',
      textColor: '#261f1f',
      iconColor: rgba('#333333', 0.6),
    }),
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
  }))
  .actions((self) => ({
    setWallpaper(newWallpaper: string) {
      self.theme.wallpaper = newWallpaper;
    },
    setTheme(newTheme: ThemeModelType) {
      self.theme = clone(newTheme);
    },
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
      app: any,
      desktopDimensions: { width: number; height: number },
      isFullscreen: boolean
    ) {
      let glob = app.glob;
      if (app.href) {
        glob = app.href.glob ? true : false;
      }
      const newWindow = Window.create({
        id: app.id,
        title: app.title,
        glob,
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
    closeBrowserWindow(appId: any) {
      if (self.activeWindow?.id === appId) {
        const nextWindow = Array.from(self.windows.values())[0].id;
        if (nextWindow) {
          self.activeWindow = self.windows.get(nextWindow);
        }
      }
      self.windows.delete(appId);
    },
  }));
export type DesktopStoreType = Instance<typeof DesktopStore>;
