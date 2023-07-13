// Bounds are using the realm.config 1-10 scale.
import { Instance, SnapshotIn, types } from 'mobx-state-tree';

import { Dimensions } from '@holium/design-system/util';

import {
  getMaximizedBounds,
  isFullyMaximizedBounds,
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
    isMaximized: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get isMinimized() {
      return self.state === 'minimized';
    },
    isFullyMaximized(desktopDimensions: Dimensions) {
      return isFullyMaximizedBounds(self.bounds, desktopDimensions);
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
    maximizeLeft(desktopDimensions: Dimensions) {
      const maximizedBounds = getMaximizedBounds(desktopDimensions);
      self.prevBounds = { ...self.bounds };
      self.bounds = {
        x: maximizedBounds.x,
        y: maximizedBounds.y,
        width: maximizedBounds.width / 2,
        height: maximizedBounds.height,
      };
    },
    maximizeRight(desktopDimensions: Dimensions) {
      const maximizedBounds = getMaximizedBounds(desktopDimensions);
      self.prevBounds = { ...self.bounds };
      self.bounds = {
        x: maximizedBounds.x + maximizedBounds.width / 2,
        y: maximizedBounds.y,
        width: maximizedBounds.width / 2,
        height: maximizedBounds.height,
      };
    },
    toggleMaximize(desktopDimensions: Dimensions) {
      const isMaximized = self.isMaximized;
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
          height: maximizedBounds.height,
        };
      }
    },
    toggleFullyMaximize(desktopDimensions: Dimensions) {
      const isMaximized = self.isFullyMaximized(desktopDimensions);
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
          height: maximizedBounds.height,
        };
      }
    },
    setIsActive(isActive: boolean) {
      self.isActive = isActive;
    },
  }));

export type AppWindowMobxType = Instance<typeof AppWindowModel>;
export type AppWindowProps = SnapshotIn<typeof AppWindowModel>;
