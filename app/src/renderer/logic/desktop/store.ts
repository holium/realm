import { osState } from './../store';
import { types, applySnapshot, Instance, tryReference } from 'mobx-state-tree';
import { toJS } from 'mobx';
import { closeAppWindow, openAppWindow } from './api';
import { DEFAULT_APP_WINDOW_DIMENSIONS } from '../space/app/dimensions';
import { getCenteredXY } from '../utils/window-manager';

const Grid = types.model({
  width: types.enumeration(['1', '2', '3']),
  height: types.enumeration(['1', '2']),
});

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
      types.enumeration(['urbit', 'web', 'native']),
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

export const DesktopStore = types
  .model('DesktopStore', {
    showHomePane: types.optional(types.boolean, false),
    isBlurred: types.optional(types.boolean, true),
    appviewPreload: types.maybe(types.string),
    isFullscreen: types.optional(types.boolean, false),
    dynamicMouse: types.optional(types.boolean, true),
    isMouseInWebview: types.optional(types.boolean, false),
    mouseColor: types.optional(types.string, '#4E9EFD'),
    desktopDimensions: types.optional(
      types.model({
        width: types.number,
        height: types.number,
      }),
      { width: 0, height: 0 }
    ),
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
  }))
  .actions((self) => ({
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
    setActive(activeWindow: WindowModelType) {
      if (self.activeWindow !== activeWindow) {
        self.activeWindow = activeWindow;
        const depth = self.windows.size;
        self.windows.forEach((win: WindowModelType) => {
          if (activeWindow.id === win.id) {
            win.setZIndex(depth + 1);
          } else {
            if (win.zIndex > 1) {
              win.setZIndex(win.zIndex - 1);
            }
          }
        });
      }
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
      const windowDimensions = self.windows.get(windowId)!.dimensions;
      applySnapshot(windowDimensions, dimensions);
    },
    openBrowserWindow(app: any, location?: any) {
      const defaultAppDimensions = {
        width: DEFAULT_APP_WINDOW_DIMENSIONS[app.id]
          ? DEFAULT_APP_WINDOW_DIMENSIONS[app.id].width
          : 600,
        height: DEFAULT_APP_WINDOW_DIMENSIONS[app.id]
          ? DEFAULT_APP_WINDOW_DIMENSIONS[app.id].height
          : 600,
      };

      const defaultXY = getCenteredXY(
        defaultAppDimensions,
        self.desktopDimensions
      );

      const newWindow = Window.create({
        id: app.id,
        title: app.title,
        zIndex: 2,
        type: app.type,
        dimensions: {
          x: app.dimensions ? app.dimensions.x : defaultXY.x,
          y: app.dimensions ? app.dimensions.y : defaultXY.y,
          width: app.dimensions
            ? app.dimensions.width
            : defaultAppDimensions.width,
          height: app.dimensions
            ? app.dimensions.height
            : defaultAppDimensions.height,
        },
      });
      self.windows.set(newWindow.id, newWindow);
      self.activeWindow = self.windows.get(newWindow.id);
      if (self.showHomePane) {
        self.showHomePane = false;
        self.isBlurred = false;
      }
      openAppWindow(toJS(location));
    },
    closeBrowserWindow(appId: any) {
      self.windows.delete(appId);
      if (self.activeWindow?.id === appId) {
        const nextWindow = Array.from(self.windows.values())[0].id;
        if (nextWindow) {
          self.activeWindow = tryReference(() => self.windows.get(nextWindow));
        }
      }
    },
  }));
