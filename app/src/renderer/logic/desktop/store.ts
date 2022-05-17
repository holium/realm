import {
  types,
  applySnapshot,
  Instance,
  tryReference,
  detach,
  destroy,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { AppModel, AppModelType } from '../../../core/ship/stores/docket';
import { closeAppWindow, openAppWindow } from './api';
import { DEFAULT_APP_WINDOW_DIMENSIONS } from '../space/app/dimensions';

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
    // order: types.number,
    id: types.identifier,
    title: types.optional(types.string, ''),
    zIndex: types.number,
    type: types.optional(
      types.enumeration(['urbit', 'web', 'native']),
      'urbit'
    ),
    // app: types.safeReference(AppModel),
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
    appviewPreload: types.maybe(types.string),
    isFullscreen: types.optional(types.boolean, false),
    dynamicMouse: types.optional(types.boolean, true),
    isMouseInWebview: types.optional(types.boolean, false),
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
  }))
  .actions((self) => ({
    setActive(activeWindow: WindowModelType) {
      self.activeWindow = activeWindow;
      const depth = self.windows.size;
      self.windows.forEach((win: WindowModelType) => {
        if (activeWindow.id === win.id) {
          win.setZIndex(depth + 1);
        } else {
          win.setZIndex(win.zIndex - 1);
        }
      });
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
      const newWindow = Window.create({
        // order: app.activeApp.order,
        id: app.id,
        title: app.title,
        zIndex: 1,
        dimensions: {
          x: app.dimensions ? app.dimensions.x : 20,
          y: app.dimensions ? app.dimensions.y : 16,
          width: DEFAULT_APP_WINDOW_DIMENSIONS[app.id]
            ? DEFAULT_APP_WINDOW_DIMENSIONS[app.id].width
            : 600,
          height: DEFAULT_APP_WINDOW_DIMENSIONS[app.id]
            ? DEFAULT_APP_WINDOW_DIMENSIONS[app.id].height
            : 600,
        },
      });
      self.windows.set(newWindow.id, newWindow);
      self.activeWindow = self.windows.get(newWindow.id);
      openAppWindow(toJS(location));
    },
    closeBrowserWindow(appId: any) {
      // console.log(self.activeWindow);
      // detach(self.activeWindow);
      self.windows.delete(appId);

      if (self.activeWindow?.id === appId) {
        const nextWindow = Array.from(self.windows.values())[0].id;
        if (nextWindow) {
          self.activeWindow = tryReference(() => self.windows.get(nextWindow));
        }
      }
    },
  }));
