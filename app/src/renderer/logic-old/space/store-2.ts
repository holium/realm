import { servicesStore } from '../../logic/store-2';
import {
  types,
  flow,
  Instance,
  applyPatch,
  getSnapshot,
  applySnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { LoaderModel } from '../stores/common/loader';
import { ThemeModel } from 'core-a/theme/store';

import {
  SpaceModel as BaseSpaceModel,
  SpacesStore as BaseSpacesStore,
} from '../../../core-a/spaces/stores/spaces';
import { DocketApp, WebApp } from '../../../core-a/ship/stores/docket';

export const SpaceModel = BaseSpaceModel.named('SpaceModel')
  .views((self) => ({}))
  .actions((self) => ({
    // syncPatches: (patchEffect: any) => {
    //   applyPatch(self, patchEffect.patch);
    // },
  }));

export type SpaceModelType = Instance<typeof SpaceModel>;
const DocketMap = types.map(types.union({ eager: false }, DocketApp, WebApp));

export const SpacesStore = types
  .compose(
    BaseSpacesStore,
    types.model({
      selected: types.maybe(SpaceModel),
      loader: types.optional(LoaderModel, { state: 'initial' }),
    })
  )
  .named('SpacesStore')
  .views((self) => ({}))
  .actions((self) => ({
    setShipSpace(ship: any) {
      const theme =
        servicesStore.shell.themeStore.ships.get(ship.patp) ||
        servicesStore.shell.themeStore.os;
      self.our = SpaceModel.create({
        path: ship.patp,
        name: ship.patp,
        type: 'our',
        // @ts-ignore FIX
        apps: {
          pinned: ['ballot', 'escape', 'webterm', 'landscape'],
          // TODO fix
          ...(ship.docket.apps
            ? {
                installed: DocketMap.create(getSnapshot(ship.docket.apps)),
              }
            : { docket: {} }),
        },
        picture: ship.avatar,
        theme: ThemeModel.create({
          themeId: ship.patp,
          wallpaper: theme.wallpaper,
          backgroundColor: theme.backgroundColor,
          dockColor: theme.dockColor,
          windowColor: theme.windowColor,
          textTheme: theme.textTheme,
          textColor: theme.textColor,
          iconColor: theme.iconColor,
          mouseColor: theme.mouseColor,
        }),
      });

      if (self.our && self.our.theme.wallpaper) {
        servicesStore.shell.themeStore.setWallpaper(self.our.theme.wallpaper, {
          patp: ship.patp,
        });
      }
    },
    syncPatches: (patchEffect: any) => {
      applyPatch(self, patchEffect.patch);
    },
  }));

export type SpacesStoreType = Instance<typeof SpacesStore>;
