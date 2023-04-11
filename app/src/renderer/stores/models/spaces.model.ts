import { Instance, types, flow, applySnapshot } from 'mobx-state-tree';
import { LoaderModel, SubscriptionModel } from './common.model';
import { DocketApp, UrbitApp, WebApp } from './bazaar.model';
import { MembersStore, VisaModel } from './members.model';
import { Theme } from './theme.model';
import { BazaarIPC, SpacesIPC } from '../ipc';
import { appState } from '../app.store';

export const DocketMap = types.map(
  types.union({ eager: false }, DocketApp, WebApp)
);

const StallModel = types.model('StallModel', {
  suite: types.map(UrbitApp), // {0: 'lexicon', 1: 'engram', 2: 'groups'}
  recommended: types.array(UrbitApp), // {'lexicon': 12, 'engram': 3, 'groups': 1}
});

export const SpaceModel = types
  .model('SpaceModel', {
    path: types.identifier,
    name: types.string,
    description: types.optional(types.string, ''),
    color: types.optional(types.string, '#000000'),
    type: types.enumeration(['group', 'our', 'space']),
    archetype: types.optional(types.enumeration(['home', 'community']), 'home'), // TODO remove the optional
    picture: types.optional(types.string, ''),
    access: types.optional(types.string, 'public'),
    theme: Theme,
    invitations: types.optional(VisaModel, {
      outgoing: {},
      incoming: {},
    }),
    members: types.optional(MembersStore, { all: {} }),
    stall: StallModel,
    dock: types.array(UrbitApp),
  })
  .views((self) => ({
    isPinned(appId: string) {
      return self.dock.map((app) => app.id === appId);
    },
    getDock() {
      return self.dock ?? [];
    },
    getDockApps() {
      return self.dock;
    },
  }))
  .actions((self) => ({
    pinApp: flow(function* (appId: string) {
      try {
        return yield BazaarIPC.pinApp(
          self.path,
          appId,
          self.dock.length
        ) as Promise<any>;
      } catch (error) {
        console.error(error);
      }
    }),
    unpinApp: flow(function* (appId: string) {
      try {
        return yield BazaarIPC.unpinApp(self.path, appId) as Promise<any>;
      } catch (error) {
        console.error(error);
      }
    }),
    reorderPinnedApps: flow(function* (dock: string[]) {
      try {
        s;
        applySnapshot(self.dock, dock);

        return yield BazaarIPC.reorderPinnedApps(
          self.path,
          dock
        ) as Promise<any>;
      } catch (error) {
        console.error(error);
      }
    }),
    addToSuite: flow(function* (appId: string, index: number) {
      try {
        return yield BazaarIPC.addToSuite(
          self.path,
          appId,
          index
        ) as Promise<any>;
      } catch (error) {
        console.error(error);
      }
    }),
    removeFromSuite: flow(function* (index: number) {
      try {
        return yield BazaarIPC.removeFromSuite(
          self.path,
          index
        ) as Promise<any>;
      } catch (error) {
        console.error(error);
      }
    }),
  }));

export type SpaceModelType = Instance<typeof SpaceModel>;

export const SpacesStore = types
  .model('SpacesStore', {
    loader: types.optional(LoaderModel, { state: 'initial' }),
    join: types.optional(LoaderModel, { state: 'initial' }),
    selected: types.safeReference(SpaceModel),
    spaces: types.map(SpaceModel),
    // friends: types.optional(FriendsStore, { all: {} }),
    subscription: types.optional(SubscriptionModel, {
      state: 'subscribing',
    }),
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
    get ourSpace() {
      return Array.from(self.spaces.values()).filter(
        (space: SpaceModelType) => space.type === 'our'
      )[0];
    },
    getSpaceByPath(spacePath: string) {
      // if (spacePath === self.our.path) {
      //   return self.our;
      // } else {
      return self.spaces.get(spacePath);
      // }
    },
    get subscriptionState() {
      return self.subscription.state;
    },
  }))
  .actions((self) => ({
    init: flow(function* () {
      self.loader.set('loading');
      try {
        const { current, spaces } =
          yield SpacesIPC.getInitial() as Promise<any>;
        // todo form the json in the backend
        spaces.forEach((space: any) => {
          space.theme.id = space.path;
          const spaceModel = SpaceModel.create({
            ...space,
            members: {
              all: space.members.reduce((map: any, mem: any) => {
                map[mem.patp] = mem;
                return map;
              }, {}),
            },
          });
          self.spaces.set(space.path, spaceModel);
        });
        self.selected = self.spaces.get(current);
        if (self.selected) {
          appState.setTheme(self.selected.theme);
        }
        self.loader.set('loaded');
      } catch (e) {
        console.error(e);
        self.loader.set('error');
      }
    }),

    joinSpace: flow(function* (spacePath: string) {
      self.join.set('loading');
      try {
        const space = yield SpacesIPC.join(spacePath) as Promise<any>;
        self.join.set('loaded');
        return space;
      } catch (e) {
        console.error(e);
        self.join.set('error');
      }
    }),

    addSpace: (addReaction: { space: any; members: any }) => {
      const space = addReaction.space;
      const newSpace = SpaceModel.create({
        ...space,
        theme: {
          id: space.path,
          ...space.theme,
        },
      });
      // newSpace.members?.initial(addReaction.members);
      self.spaces.set(space.path, newSpace);
      return newSpace.path;
    },
    updateSpace: (replaceReaction: { space: any }) => {
      const members = self.spaces.get(replaceReaction.space.path)?.members;
      replaceReaction.space.theme.id = replaceReaction.space.path;
      self.spaces.set(replaceReaction.space.path, {
        ...replaceReaction.space,
        members,
      });
    },
    deleteSpace: (
      ourSpace: string,
      deleteReaction: { 'space-path': string },
      setTheme: (theme: any) => void
    ) => {
      const path = deleteReaction['space-path'];
      //
      if (path === self.selected?.path) {
        // set to our space
        self.selected = self.spaces.get(ourSpace);
        console.log(self.selected?.path);
        setTheme(self.selected?.theme);
      }
      self.spaces.delete(path);
      return path;
    },
    setLoader(status: 'initial' | 'loading' | 'error' | 'loaded') {
      self.loader.state = status;
    },
    setJoin(status: 'initial' | 'loading' | 'error' | 'loaded') {
      self.join.state = status;
    },
    setOurSpace(ourSpace: any) {
      // self.our = ourSpace;
      if (!self.selected) self.selected = ourSpace;
    },
    selectSpace(spacePath: string) {
      self.selected = self.spaces.get(spacePath);
      if (self.selected) {
        appState.setTheme(self.selected.theme);
        SpacesIPC.setSelectedSpace(spacePath);
      }
      return self.selected;
    },
    setSubscriptionStatus: (
      newSubscriptionStatus: 'subscribed' | 'subscribing' | 'unsubscribed'
    ) => {
      self.subscription.set(newSubscriptionStatus);
    },
  }));

export type SpacesStoreType = Instance<typeof SpacesStore>;
