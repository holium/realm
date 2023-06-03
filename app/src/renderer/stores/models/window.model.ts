// Bounds are using the realm.config 1-10 scale.
import { Instance, SnapshotIn, types } from 'mobx-state-tree';

import { Dimensions } from '@holium/design-system';

import {
  getMaximizedBounds,
  isMaximizedBounds,
  normalizeValue,
} from '../../lib/window-manager';
import { Glob } from './docket.model';

const BoundsModel = types.model({
  x: types.number,
  y: types.number,
  width: types.number,
  height: types.number,
});

export type BoundsModelType = Instance<typeof BoundsModel>;

export const AppWindowModel = types
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
    /**
     *  The window is static and cannot be moved or resized.
     */
    static: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get isMinimized() {
      return self.state === 'minimized';
    },
    isMaximized(desktopDimensions: Dimensions) {
      return isMaximizedBounds(self.bounds, desktopDimensions);
    },
  }))
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
    maximizeLeft(desktopDimensions: Dimensions, isFullscreen: boolean) {
      const maximizedBounds = getMaximizedBounds(desktopDimensions);
      self.prevBounds = { ...self.bounds };
      self.bounds = {
        x: maximizedBounds.x,
        y: maximizedBounds.y,
        width: maximizedBounds.width / 2,
        height: isFullscreen
          ? maximizedBounds.height
          : maximizedBounds.height -
            normalizeValue(30, desktopDimensions.height),
      };
    },
    maximizeRight(desktopDimensions: Dimensions, isFullscreen: boolean) {
      const maximizedBounds = getMaximizedBounds(desktopDimensions);
      self.prevBounds = { ...self.bounds };
      self.bounds = {
        x: maximizedBounds.x + maximizedBounds.width / 2,
        y: maximizedBounds.y,
        width: maximizedBounds.width / 2,
        height: isFullscreen
          ? maximizedBounds.height
          : maximizedBounds.height -
            normalizeValue(30, desktopDimensions.height),
      };
    },
    toggleMaximize(desktopDimensions: Dimensions, isFullscreen: boolean) {
      const isMaximized = self.isMaximized(desktopDimensions);
      if (isMaximized) {
        const bounds = { ...self.bounds };
        self.bounds = { ...self.prevBounds };
        self.prevBounds = bounds;
      } else {
        self.prevBounds = { ...self.bounds };
        const maximizedBounds = getMaximizedBounds(desktopDimensions);
        self.bounds = {
          x: maximizedBounds.x,
          y: maximizedBounds.y,
          width: maximizedBounds.width,
          height: isFullscreen
            ? maximizedBounds.height
            : maximizedBounds.height -
              normalizeValue(30, desktopDimensions.height),
        };
      }
    },
    setIsActive(isActive: boolean) {
      self.isActive = isActive;
    },
  }));

export type AppWindowMobxType = Instance<typeof AppWindowModel>;
export type AppWindowProps = SnapshotIn<typeof AppWindowModel>;
