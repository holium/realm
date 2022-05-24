import { LoaderModel } from './../stores/common/loader';
import {
  types,
  Instance,
  flow,
  applySnapshot,
  getSnapshot,
  castToSnapshot,
  clone,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import MockData from './mock';
import { DocketApp, WebApp } from '../../../core/ship/stores/docket';
import { ShipModelType } from '../ship/store';
import { osState } from '../store';
import { ThemeModel } from 'core/theme/store';

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
      return Array.from(self.apps.docket!.values()).filter((app: any) =>
        self.apps.pinned.includes(app.id)
      );
    },
  }))
  .actions((self) => ({
    load(spaceId: string) {
      applySnapshot(self, MockData[spaceId]);
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
      const theme =
        osState.themeStore.ships.get(ship.patp) || osState.themeStore.os;
      self.spaces.set(
        ship.patp,
        Space.create({
          id: ship.patp,
          name: ship.patp,
          color: ship.color || '#000000',
          type: 'our',
          // @ts-ignore FIX
          apps: {
            pinned: ['ballot', 'escape', 'webterm', 'bitcoin', 'landscape'],
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
      if (!self.selected) {
        self.selected = self.spaces.get(ship.patp)!;
        if (self.selected.theme.wallpaper) {
          osState.themeStore.setWallpaper(self.selected.theme.wallpaper, {
            patp: ship.patp,
          });
        }
      }
      // Set temp other spaces
      // self.spaces.set(
      //   'other-life',
      //   ThemeModel.create(castToSnapshot(MockData['other-life'].theme!))
      // );
    },
    selectSpace(spaceKey: string) {
      self.selected = self.spaces.get(spaceKey)!;
      // TODO make the theme system better
      console.log(toJS(self.selected.theme));
      // const theme =
      //   osState.themeStore.spaces.get(spaceKey) || osState.themeStore.os;
      // self.selected.theme = ThemeModel.create({
      //   themeId: `${spaceKey}`,
      //   wallpaper: self.selected.theme.wallpaper,
      //   backgroundColor: theme.backgroundColor,
      //   dockColor: theme.dockColor,
      //   windowColor: theme.windowColor,
      //   textTheme: theme.textTheme,
      //   textColor: theme.textColor,
      //   iconColor: theme.iconColor,
      //   mouseColor: theme.mouseColor,
      // });
      osState.themeStore.setCurrentSpaceTheme(spaceKey);
      // if (
      //   self.selected.theme.wallpaper !== osState.themeStore.theme.wallpaper
      // ) {
      //   console.log(self.selected.theme.wallpaper);
      //   osState.themeStore.setWallpaper(self.selected.theme.wallpaper, {
      //     spaceId: spaceKey,
      //   });
      // }
    },
    load(selectedKey: string, themeStore: any) {
      Object.keys(MockData).forEach((spaceKey: string) => {
        self.spaces.set(spaceKey, Space.create(MockData[spaceKey]));
      });
      if (selectedKey) {
        self.selected = self.spaces.get(selectedKey);
        if (self.selected!.theme.wallpaper) {
          themeStore.setWallpaper(self.selected!.theme.wallpaper, {
            spaceId: selectedKey,
          });
        }
      }
    },
  }));

export type SpaceStoreType = Instance<typeof SpaceStore>;
