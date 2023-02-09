import { types, applySnapshot, Instance, SnapshotIn } from 'mobx-state-tree';
import { AppType, Glob } from '../spaces/models/bazaar';
import { getInitialWindowBounds } from './lib/window-manager';

// Bounds are using the realm.config 1-10 scale.
const BoundsModel = types.model({
  x: types.number,
  y: types.number,
  width: types.number,
  height: types.number,
});

type BoundsModelType = Instance<typeof BoundsModel>;

const WindowModel = types
  .model('WindowModel', {
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
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }),
    /**
     * The ative window has a titlebar with full contrast.
     */
    active: types.optional(types.boolean, false),
    /**
     * The visual state of the window.
     */
    state: types.optional(
      types.enumeration(['normal', 'minimized', 'maximized', 'fullscreen']),
      'normal'
    ),
  })
  .actions((self) => ({
    setZIndex(newZ: number) {
      self.zIndex = newZ;
    },
  }))
  .views((self) => ({
    get isMinimized() {
      return self.state === 'minimized';
    },
    get isMaximized() {
      return self.state === 'maximized';
    },
    get isFullscreen() {
      return self.state === 'fullscreen';
    },
    get isNormal() {
      return self.state === 'normal';
    },
    get isActive() {
      return self.active;
    },
  }))
  .actions((self) => ({
    normal() {
      self.state = 'normal';
      self.bounds = self.prevBounds;
    },
    minimize() {
      self.state = 'minimized';
      self.prevBounds = self.bounds;
    },
    maximize() {
      self.state = 'maximized';
      self.prevBounds = self.bounds;
    },
    fullscreen() {
      self.state = 'fullscreen';
      self.prevBounds = self.bounds;
    },
    setIsActive(isActive: boolean) {
      self.active = isActive;
    },
  }));

export interface WindowModelType extends Instance<typeof WindowModel> {}
export interface CreateWindowProps extends SnapshotIn<typeof WindowModel> {}

export const DesktopStore = types
  .model('DesktopStore', {
    windows: types.map(WindowModel),
    mouseColor: types.optional(types.string, '#4E9EFD'),
    homePaneOpen: types.optional(types.boolean, false),
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
    setActive(appId: string) {
      self.windows.forEach((window) => {
        window.setIsActive(window.appId === appId);
      });
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
      const newWindow = WindowModel.create({
        appId: app.id,
        title: app.title,
        glob,
        href,
        active: true,
        state: 'normal',
        zIndex: self.windows.size + 1,
        type: app.type,
        bounds: getInitialWindowBounds(app),
      });

      self.windows.set(newWindow.appId, newWindow);
      if (self.homePaneOpen) self.homePaneOpen = false;

      return newWindow;
    },
    openDialog(windowProps: CreateWindowProps) {
      const newWindow = WindowModel.create(windowProps);

      self.windows.set(newWindow.appId, newWindow);

      return newWindow;
    },
    toggleMinimize(appId: string) {
      const window = self.getWindowByAppId(appId);
      if (!window) return console.error('Window not found');

      if (window.state === 'minimized') window.normal();
      else window.minimize();
    },
    toggleMaximize(appId: string) {
      const window = self.getWindowByAppId(appId);
      if (!window) return console.error('Window not found');

      if (window.state === 'maximized') window.normal();
      else window.maximize();
    },
    closeWindow(appId: string) {
      self.windows.delete(appId);
    },
  }));

export type DesktopStoreType = Instance<typeof DesktopStore>;
