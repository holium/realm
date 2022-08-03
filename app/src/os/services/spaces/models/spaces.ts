import {
  Instance,
  types,
  applySnapshot,
  castToSnapshot,
  clone,
  applyPatch,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { ThemeModel } from '../../shell/theme.model';
import { LoaderModel } from '../../common.model';
import { DocketApp, WebApp } from '../../ship/models/docket';
import { NativeAppList } from '../../../../renderer/apps';

import { TokenModel } from './token';

export const DocketMap = types.map(
  types.union({ eager: false }, DocketApp, WebApp)
);

export const Invite = types.model({
  inviter: types.string,
  patp: types.string,
  role: types.string,
  message: types.string,
  name: types.string,
  type: types.string,
  invitedAt: types.Date,
});

export const InvitationsModel = types
  .model({
    incoming: types.map(Invite), // Map<SpacePath, Invite>
    outgoing: types.map(types.map(Invite)), // Map<SpacePath, Map<Patp, Invite>>
  })
  .views((self) => ({
    get invitations() {
      return self.incoming;
    },
    get sent() {
      return self.outgoing;
    },
    sentByPlace(placePath: string) {
      return self.outgoing.get(placePath);
    },
  }))
  .actions((self) => ({
    initial(data: any) {
      // set initial data
    },
    updateIncoming(data: any) {
      // update incoming invitations
    },
    updateOutgoing(data: any) {
      // update outgoing invitations
    },
  }));

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
    invitations: types.optional(InvitationsModel, {
      outgoing: {},
      incoming: {},
    }),
    apps: types.model({
      pinned: types.array(types.string),
      endorsed: DocketMap, // recommended
      installed: DocketMap, // registered
    }),
  })
  .views((self) => ({
    get pinnedApps() {
      // console.log(toJS(self.apps.pinned), toJS(self.apps.installed));
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
    initialScry: (data: any, tempApps: any, persistedState: any) => {
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
          const persistedData =
            persistedState && persistedState.spaces
              ? persistedState.spaces[path]
              : {};
          data[path].apps = {
            ...persistedData.apps,
            installed: clone(tempApps.installed),
          };
        }
      );
      applySnapshot(self.spaces, data);

      if (!self.selected) self.selected = self.our;
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
      if (self.selected === path) self.selected = self.our; // TODO do this outside of this function
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
