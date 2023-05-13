// Bounds are using the realm.config 1-10 scale.
import { Instance, SnapshotIn, types } from 'mobx-state-tree';

import { Dimensions } from '@holium/design-system';

import {
  getMaximizedBounds,
  isMaximizedBounds,
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
     * The ative window has a titlebar with full contrast.
     */
    isActive: types.optional(types.boolean, false),
    /**
     * The visual state of the window.
     */
    state: types.optional(
      types.enumeration(['normal', 'minimized', 'fullscreen']),
      'normal'
    ),
  })
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
    maximize(desktopDimensions: Dimensions) {
      const isMaximized = isMaximizedBounds(self.bounds, desktopDimensions);
      if (isMaximized) {
        self.bounds = { ...self.prevBounds };
      } else {
        self.prevBounds = { ...self.bounds };
        self.bounds = getMaximizedBounds(desktopDimensions);
      }
    },
    setIsActive(isActive: boolean) {
      self.isActive = isActive;
    },
  }))
  .views((self) => ({
    get isMinimized() {
      return self.state === 'minimized';
    },
  }));

export interface AppWindowMobxType extends Instance<typeof AppWindowModel> {}
export interface AppWindowProps extends SnapshotIn<typeof AppWindowModel> {}
