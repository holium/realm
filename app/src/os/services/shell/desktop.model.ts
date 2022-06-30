// import { osState, shipState } from './../store';
import { types, applySnapshot, Instance } from 'mobx-state-tree';
import { toJS } from 'mobx';
// import { setPartitionCookies } from './api';
import { getInitialWindowDimensions } from './lib/window-manager';
import { NativeAppList } from 'renderer/apps';
import { ThemeModel, ThemeModelType } from './theme.model';

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
  title: string;
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
    isBlurred: types.optional(types.boolean, true),
    appviewPreload: types.maybe(types.string),
    isFullscreen: types.optional(types.boolean, false),
    dynamicMouse: types.optional(types.boolean, true),
    isMouseInWebview: types.optional(types.boolean, false),
    mouseColor: types.optional(types.string, '#4E9EFD'),
    theme: types.optional(ThemeModel, {
      themeId: 'os',
      wallpaper:
        'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100',
      backgroundColor: '#c2b4b4',
      dockColor: '#f0ecec',
      windowColor: '#f0ecec',
      textTheme: 'light',
      textColor: '#261f1f',
      iconColor: '#333333',
      mouseColor: '#4E9EFD',
    }),
    desktopDimensions: types.optional(
      types.model({
        width: types.number,
        height: types.number,
      }),
      { width: 0, height: 0 }
    ),
    activeWindow: types.safeReference(Window),
    windows: types.map(Window),
    dialogId: types.maybe(types.string),
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
    openDialog(dialogId: string) {
      self.dialogId = dialogId;
    },
    closeDialog() {
      self.dialogId = undefined;
    },
    setWallpaper(newWallpaper: string) {
      self.theme.wallpaper = newWallpaper;
    },
    setTheme(newTheme: ThemeModelType) {
      self.theme = newTheme;
    },
    setDesktopDimensions(width: number, height: number) {
      self.desktopDimensions = {
        width,
        height,
      };
    },
    setMouseColor(newMouseColor: string) {
      self.mouseColor = newMouseColor;
    },
    setHomePane(isHome: boolean) {
      self.showHomePane = isHome;
      if (isHome) {
        self.isBlurred = true;
      } else {
        self.isBlurred = false;
      }
    },
    setIsBlurred(isBlurred: boolean) {
      self.isBlurred = isBlurred;
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
    setFullscreen(isFullscreen: boolean) {
      self.isFullscreen = isFullscreen;
    },
    setAppviewPreload(preloadPath: string) {
      self.appviewPreload = preloadPath;
    },
    setIsMouseInWebview(inWebview: boolean) {
      self.isMouseInWebview = inWebview;
    },
    setDimensions(windowId: string, dimensions: DimensionModelType) {
      const windowDimensions = self.windows.get(windowId)?.dimensions;
      windowDimensions && applySnapshot(windowDimensions, dimensions);
    },
    openBrowserWindow(app: any) {
      const newWindow = Window.create({
        id: app.id,
        title: app.title,
        zIndex: self.windows.size + 1,
        type: app.type,
        dimensions: getInitialWindowDimensions(
          app,
          self.desktopDimensions,
          self.isFullscreen
        ),
      });
      self.windows.set(newWindow.id, newWindow);
      self.activeWindow = self.windows.get(newWindow.id);
      if (self.showHomePane) {
        self.showHomePane = false;
        self.isBlurred = false;
      }
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
