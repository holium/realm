import { types, applySnapshot, Instance } from 'mobx-state-tree';
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

const Window = types.model({
  // order: types.number,
  id: types.identifier,
  title: types.optional(types.string, ''),
  zIndex: types.number,
  // app: types.safeReference(AppModel),
  dimensions: DimensionsModel,
});

export const DesktopStore = types
  .model({
    appviewPreload: types.maybe(types.string),
    isFullscreen: types.optional(types.boolean, false),
    dynamicMouse: types.optional(types.boolean, true),
    isMouseInWebview: types.optional(types.boolean, false),
    mouseColor: types.optional(types.string, '#4E9EFD'),
    activeApp: types.safeReference(Window),
    windows: types.map(Window),
  })
  .views((self) => ({
    get currentOrder() {
      return self.windows.size + 1;
    },
    get hasOpenWindow() {
      return self.activeApp !== undefined;
    },
  }))
  .actions((self) => ({
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
      self.activeApp = self.windows.get(newWindow.id);
      openAppWindow(toJS(location));
    },
    closeBrowserWindow(appId: any) {
      if (self.activeApp?.id === appId) {
        self.activeApp = undefined;
      }
      self.windows.delete(appId);
      self.activeApp = undefined;
      // closeAppWindow(toJS(app));
    },
  }));
