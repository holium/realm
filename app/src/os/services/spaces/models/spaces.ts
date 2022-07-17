import {
  Instance,
  types,
  applySnapshot,
  castToSnapshot,
  clone,
  applyPatch,
} from 'mobx-state-tree';
import { ThemeModel } from '../../shell/theme.model';
import { LoaderModel } from '../../common.model';
import { DocketApp, WebApp } from '../../ship/models/docket';
import { NativeAppList } from '../../../../renderer/apps';

import { TokenModel } from './token';

export const DocketMap = types.map(
  types.union({ eager: false }, DocketApp, WebApp)
);

export const SpaceModel = types
  .model('SpaceModel', {
    path: types.identifier,
    name: types.string,
    color: types.maybeNull(types.string),
    type: types.enumeration(['group', 'our', 'space']),
    archetype: types.optional(types.enumeration(['home', 'lodge']), 'home'), //TODO remove the optional
    picture: types.maybeNull(types.string),
    theme: ThemeModel,
    token: types.maybe(TokenModel),
    apps: types.model({
      pinned: types.array(types.string),
      endorsed: DocketMap, // recommended
      installed: DocketMap, // registered
    }),
  })
  .views((self) => ({
    get pinnedApps() {
      const pins = self.apps.pinned;
      return [...Array.from(self.apps.installed!.values()), ...NativeAppList]
        .filter((app: any) => self.apps.pinned.includes(app.id))
        .sort((a, b) => pins.indexOf(a.id) - pins.indexOf(b.id));
    },
    isAppPinned(appId: string) {
      return self.apps.pinned.includes(appId);
    },
    getAppData(appId: string) {
      const apps = Array.from(self.apps.installed.values());
      return [...apps, ...NativeAppList].find((app: any) => app.id === appId);
    },
    get spaceApps() {
      const apps = Array.from(self.apps.installed.values());
      return [...apps, ...NativeAppList];
    },
  }))
  .actions((self) => ({
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

export type SpaceModelType = Instance<typeof SpaceModel>;

export const SpacesStore = types
  .model('SpacesStore', {
    loader: types.optional(LoaderModel, { state: 'initial' }),
    selected: types.safeReference(SpaceModel),
    our: types.maybe(SpaceModel),
    spaces: types.map(SpaceModel),
  })
  .views((self) => ({
    get isLoading() {
      return self.loader.state === 'loading';
    },
    get isLoaded() {
      return self.loader.state === 'loaded';
    },
    get spacesList() {
      return Array.from(self.spaces.values()).filter(
        (space: SpaceModelType) => space.type !== 'our'
      );
    },
    getSpaceByPath(spacePath: string) {
      if (spacePath === self.our!.path) {
        return self.our;
      } else {
        return self.spaces.get(spacePath)!;
      }
    },
  }))
  .actions((self) => ({
    initialScry: (data: any, tempApps: any) => {
      const spacesList = Object.entries(data);
      const our = spacesList.filter(
        ([_path, space]: [path: string, space: any]) => space.type === 'our'
      )[0];
      const ourSpace: any = our[1];
      self.our = SpaceModel.create({
        ...ourSpace,
        path: our[0],
        apps: tempApps,
      });
      delete data[our[0]!];
      Object.entries(data).forEach(
        ([path, space]: [path: string, space: any]) => {
          data[path].apps = {
            pinned: [],
            endorsed: {},
            installed: {},
          };
        }
      );
      applySnapshot(self.spaces, data);

      if (!self.selected) self.selected = self.our;
      // return self.selected!;
    },
    initialSync: (syncEffect: { key: string; model: typeof self }) => {
      applySnapshot(self, castToSnapshot(syncEffect.model));
      self.loader.set('loaded');
    },
    addSpace: (addReaction: any) => {
      const space = addReaction['spaces-reaction'].add.space;
      space.apps = {
        pinned: [],
        endorsed: {},
        installed: {},
      };
      const newSpace = SpaceModel.create(space);
      self.spaces.set(space.path, SpaceModel.create(space));
      return newSpace;
    },
    deleteSpace: (deleteReaction: any) => {
      const path = deleteReaction['spaces-reaction'].remove['space-path'];
      if (self.selected === path) self.selected = self.our;
      self.spaces.delete(path);

      return path;
    },
    setLoader(status: 'initial' | 'loading' | 'error' | 'loaded') {
      self.loader.state = status;
    },
    setOurSpace(ourSpace: any) {
      self.our = ourSpace;
      if (!self.selected) self.selected = ourSpace;
    },
    selectSpace(spacePath: string) {
      if (spacePath === self.our!.path) {
        self.selected = self.our;
      } else {
        self.selected = self.spaces.get(spacePath)!;
      }
      return self.selected!;
    },
  }));

export type SpacesStoreType = Instance<typeof SpacesStore>;
