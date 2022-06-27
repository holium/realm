import { LoaderModel } from '../stores/common/loader';
import { types, Instance, applySnapshot, getSnapshot } from 'mobx-state-tree';
import { toJS } from 'mobx';
import MockData from './mock';
import { DocketApp, WebApp } from '../../../core-a/ship/stores/docket';
import { ShipModelType } from '../ship/store';
import { osState } from '../store';
import { ThemeModel } from 'core-a/theme/store';
import { NativeAppList } from 'renderer/apps';
import { shipState } from 'renderer/logic/store';

const DocketMap = types.map(types.union({ eager: false }, DocketApp, WebApp));
export const Space = types
  .model('SpaceModel', {
    loader: types.optional(LoaderModel, { state: 'initial' }),
    id: types.identifier,
    name: types.string,
    color: types.string,
    type: types.enumeration(['our', 'group', 'dao', 'colony']),
    picture: types.maybeNull(types.string),
    members: types.maybeNull(
      types.model({
        count: types.number,
        list: types.array(
          types.model({
            patp: types.string,
            role: types.string,
          })
        ),
      })
    ),
    theme: ThemeModel,
    apps: types.model({
      pinned: types.array(types.string),
      docket: DocketMap,
    }),
    token: types.maybeNull(
      types.model({
        chain: types.string,
        network: types.string,
        contract: types.string,
        symbol: types.string,
      })
    ),
  })
  .views((self) => ({
    get pinnedApps() {
      const pins = self.apps.pinned;
      return [...Array.from(self.apps.docket!.values()), ...NativeAppList]
        .filter((app: any) => self.apps.pinned.includes(app.id))
        .sort((a, b) => pins.indexOf(a.id) - pins.indexOf(b.id));
    },
    isAppPinned(appId: string) {
      return self.apps.pinned.includes(appId);
    },
    getAppData(appId: string) {
      const apps = shipState.ship
        ? [...shipState.ship!.apps, ...NativeAppList]
        : [...NativeAppList];
      return apps.find((app: any) => app.id === appId);
    },

    get spaceApps() {
      return shipState.ship
        ? [...shipState.ship!.apps, ...NativeAppList]
        : [...NativeAppList];
    },
  }))
  .actions((self) => ({
    load(spaceId: string) {
      applySnapshot(self, MockData[spaceId]);
    },
    pinApp(appId: string) {
      self.apps.pinned.push(appId);
    },
    unpinApp(appId: string) {
      self.apps.pinned.remove(appId);
    },
    setPinnedOrder(newOrder: any) {
      self.apps.pinned = newOrder;
    },
  }));
export type SpaceModelType = Instance<typeof Space>;

export const SpaceStore = types
  .model('SpaceStore', {
    loader: types.optional(LoaderModel, { state: 'initial' }),
    selected: types.safeReference(Space),
    spaces: types.map(Space),
  })
  .views((self) => ({
    get spacesList() {
      return Array.from(self.spaces.values()).filter(
        (space: SpaceModelType) => space.type !== 'our'
      );
    },
  }))
  .actions((self) => ({
    setShipSpace(ship: ShipModelType) {
      const theme = osState.theme.ships.get(ship.patp) || osState.theme.os;
      self.spaces.set(
        ship.patp,
        Space.create({
          id: ship.patp,
          name: ship.patp,
          color: ship.color || '#000000',
          type: 'our',
          // @ts-ignore FIX
          apps: {
            pinned: ['ballot', 'escape', 'webterm', 'landscape'],
            // TODO fix
            ...(ship.docket.apps
              ? {
                  docket: DocketMap.create(getSnapshot(ship.docket.apps)),
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
        })
      );
      self.selected = self.spaces.get(ship.patp)!;

      if (self.selected && self.selected.theme.wallpaper) {
        osState.theme.setWallpaper(self.selected.theme.wallpaper, {
          patp: ship.patp,
        });
      }
    },
    selectSpace(spaceKey: string) {
      self.selected = self.spaces.get(spaceKey)!;
      osState.theme.setCurrentSpaceTheme(spaceKey);
      // if (
      //   self.selected.theme.wallpaper !== osState.theme.theme.wallpaper
      // ) {
      //   console.log(self.selected.theme.wallpaper);
      //   osState.theme.setWallpaper(self.selected.theme.wallpaper, {
      //     spaceId: spaceKey,
      //   });
      // }
    },
    load(selectedKey: string, theme: any) {
      Object.keys(MockData).forEach((spaceKey: string) => {
        self.spaces.set(spaceKey, Space.create(MockData[spaceKey]));
      });
      if (selectedKey) {
        self.selected = self.spaces.get(selectedKey);
        if (self.selected!.theme.wallpaper) {
          theme.setWallpaper(self.selected!.theme.wallpaper, {
            spaceId: selectedKey,
          });
        }
      }
    },
  }));

export type SpaceStoreType = Instance<typeof SpaceStore>;

// import {
//   types,
//   flow,
//   Instance,
//   applyPatch,
//   applySnapshot,
//   castToSnapshot,
// } from 'mobx-state-tree';
// import { LoaderModel } from '../stores/common/loader';

// import {
//   SpaceModel as BaseSpaceModel,
//   SpacesStore as BaseSpacesStore,
// } from '../../../core/spaces/stores/spaces';

// export const SpaceModel = BaseSpaceModel.named('SpaceModel')
//   .views((self) => ({}))
//   .actions((self) => ({
//     // syncPatches: (patchEffect: any) => {
//     //   applyPatch(self, patchEffect.patch);
//     // },
//   }));

// export type SpaceModelType = Instance<typeof SpaceModel>;

// export const SpacesStore = types
//   .compose(
//     BaseSpacesStore,
//     types.model({
//       loader: types.optional(LoaderModel, { state: 'initial' }),
//     })
//   )
//   .named('SpacesStore')
//   .views((self) => ({}))
//   .actions((self) => ({
//     syncPatches: (patchEffect: any) => {
//       applyPatch(self, patchEffect.patch);
//     },
//   }));

// export type SpacesStoreType = Instance<typeof SpacesStore>;
