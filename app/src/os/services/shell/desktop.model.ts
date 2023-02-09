import { types, applySnapshot, Instance } from 'mobx-state-tree';
import { AppType, Glob } from '../spaces/models/bazaar';
import { getInitialWindowBounds } from './lib/window-manager';

// Bounds are normalized to a 10x10 grid.
const BoundsModel = types.model({
  x: types.number,
  y: types.number,
  width: types.number,
  height: types.number,
});

type BoundsModelType = Instance<typeof BoundsModel>;

export const WindowModel = types
  .model('WindowModel', {
    /**
     * The `appId` is used to map the window to the corresponding app.
     */
    appId: types.identifier,
    glob: types.optional(types.boolean, false),
    href: types.maybeNull(Glob),
    /**
     * The `title` is shown in the titlebar.
     */
    title: types.optional(types.string, ''),
    /**
     * The z-index of the window.
     */
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
     * Needed for returning from maximized state.
     */
    prevBounds: types.optional(BoundsModel, {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }),
    /**
     * Whether the window is active.
     */
    isActive: types.optional(types.boolean, false),
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
      return self.isActive;
    },
  }));

export interface WindowModelType extends Instance<typeof WindowModel> {}

export const DesktopStore = types
  .model('DesktopStore', {
    windows: types.map(WindowModel),
    mouseColor: types.optional(types.string, '#4E9EFD'),
    isHomePaneOpen: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get hasOpenWindow() {
      return self.windows.size > 0;
    },
    get openWindows() {
      return Array.from(self.windows.values());
    },
    isOpenWindow(appId: string) {
      return (
        Array.from(self.windows.values()).findIndex(
          (appWindow) => appWindow.appId === appId
        ) > -1
      );
    },
    getWindowByAppId(appId: string) {
      return self.windows.get(appId);
    },
    get isHomePaneOpen() {
      return self.isHomePaneOpen;
    },
  }))
  .actions((self) => ({
    setMouseColor(color: string) {
      self.mouseColor = color;
    },
    openHomePane() {
      self.isHomePaneOpen = true;
    },
    closeHomePane() {
      self.isHomePaneOpen = false;
    },
    setActive(appId: string) {
      self.windows.forEach((window) => {
        window.isActive = window.appId === appId;
      });
    },
    setBounds(appId: string, bounds: BoundsModelType) {
      const windowDimensions = self.windows.get(appId)?.bounds;
      if (windowDimensions) applySnapshot(windowDimensions, bounds);
    },
    openWindow(
      app: AppType,
      desktopDimensions: Pick<BoundsModelType, 'width' | 'height'>
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
      const newWindow = WindowModel.create({
        appId: app.id,
        title: app.title,
        glob,
        href,
        isActive: true,
        state: 'normal',
        zIndex: self.windows.size + 1,
        type: app.type,
        bounds: getInitialWindowBounds(app, desktopDimensions),
      });

      self.windows.set(newWindow.appId, newWindow);
      if (self.isHomePaneOpen) self.isHomePaneOpen = false;

      return newWindow;
    },
    toggleMinimize(appId: string) {
      const window = self.windows.get(appId);
      if (!window) return console.error('WindowModel not found');

      if (window.state === 'minimized' && window.prevBounds) {
        window.state = 'normal';
        window.bounds = window.prevBounds;
      } else {
        window.state = 'minimized';
        window.prevBounds = window.bounds;
      }
    },
    toggleMaximize(appId: string) {
      const window = self.windows.get(appId);
      if (!window) return console.error('WindowModel not found');

      if (window.state === 'maximized' && window.prevBounds) {
        window.state = 'normal';
        window.bounds = window.prevBounds;
      } else {
        window.state = 'maximized';
        window.prevBounds = window.bounds;
      }
    },
    closeWindow(appId: string) {
      self.windows.delete(appId);
    },
  }));

export type DesktopStoreType = Instance<typeof DesktopStore>;
