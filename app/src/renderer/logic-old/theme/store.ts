import {
  types,
  flow,
  Instance,
  clone,
  applySnapshot,
  applyPatch,
  castToSnapshot,
  getSnapshot,
} from 'mobx-state-tree';
import { sendAction } from '../../logic/actions/realm.core';
import {
  ThemeModel as BaseThemeModel,
  ThemeStore as BaseThemeStore,
} from '../../../core-a/theme/store';

export const ThemeModel = BaseThemeModel.named('ThemeModel').actions(
  (self) => ({
    //
    setMouseColor(color: string) {
      self.mouseColor = color;
    },
  })
);

export const ThemeStore = BaseThemeStore.named('ThemeStore')
  .views((self) => ({
    // get currentTheme() {
    // }
  }))
  .actions((self) => ({
    initialSync: (syncEffect: {
      key: string;
      model: Instance<typeof self>;
    }) => {
      // Apply persisted snapshot
      applySnapshot(self, castToSnapshot(syncEffect.model));
      // if (!self.selected) {
      //   self.selected = Array.from(self.ships.values())[0];
      // }
      self.loader.set('loaded');
    },
    syncPatches: (patchEffect: any) => {
      console.log('patching in auth');
      // apply background patches
      applyPatch(self, patchEffect.patch);
    },
    setShipTheme(patp: string) {
      const action = {
        action: 'set-ship-theme',
        resource: 'theme.manager',
        context: {
          ship: patp,
        },
        data: {
          key: `ships.${patp}`,
          value: getSnapshot(self),
        },
      };
      sendAction(action);
    },
    setSpaceTheme(spaceId: string) {
      const action = {
        action: 'set-space-theme',
        resource: 'theme.manager',
        context: {
          space: spaceId,
        },
        data: {
          key: `spaces.${spaceId}`,
          value: getSnapshot(self),
        },
      };
      sendAction(action);
    },
  }));
