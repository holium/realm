import { types, castToReferenceSnapshot } from 'mobx-state-tree';
import { toJS } from 'mobx';
import { AppModel, AppModelType } from '../../../core/ship/stores/docket';
import { closeAppWindow, openAppWindow } from './api';

const Grid = types.model({
  width: types.enumeration(['1', '2', '3']),
  height: types.enumeration(['1', '2']),
});

const Window = types.model({
  id: types.identifier,
  title: types.optional(types.string, ''),
  zIndex: types.number,
  app: types.safeReference(AppModel),
  grid: Grid,
  bounds: types.model({
    x: types.number,
    y: types.number,
    width: types.number,
    height: types.number,
  }),
});

export const DesktopStore = types
  .model({
    isFullscreen: types.optional(types.boolean, false),
    activeApp: types.maybe(Window),
    windows: types.map(Window),
  })
  .views((self) => ({
    get hasOpenWindow() {
      return self.activeApp !== undefined;
    },
  }))
  .actions((self) => ({
    setFullscreen(isFullscreen: boolean) {
      self.isFullscreen = isFullscreen;
    },
    openBrowserWindow(app: any) {
      openAppWindow(app);
    },
    closeBrowserWindow(app: any) {
      closeAppWindow(toJS(app));
    },
    setActiveApp(app: AppModelType) {
      if (self.activeApp?.id === app.href.glob.base) {
        return;
      }
      self.activeApp = Window.create({
        id: app.href.glob.base,
        title: app.title,
        zIndex: 1,
        app: castToReferenceSnapshot(app),
        grid: { height: '1', width: '1' },
        bounds: {
          x: 0,
          y: 100,
          width: 800,
          height: 300,
        },
      });
      // TODO check if in the windows map and add if not
      console.log(self.activeApp);
    },
    closeApp(id: string) {
      if (self.activeApp?.id === id) {
        self.activeApp = undefined;
      }
    },
  }));
