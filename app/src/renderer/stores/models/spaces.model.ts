import {
  Instance,
  types,
  flow,
  applySnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { LoaderModel, SubscriptionModel } from './common.model';
import { DocketApp, UrbitApp, WebApp } from './bazaar.model';
import { MembersStore, VisaModel } from './members.model';
import { Theme, defaultTheme } from './theme.model';
import { BazaarIPC, SpacesIPC } from '../ipc';
import { appState } from '../app.store';
import { NewSpace } from 'os/services-new/ship/spaces/spaces.service';

export const DocketMap = types.map(
  types.union({ eager: false }, DocketApp, WebApp)
);

const StallModel = types.model('StallModel', {
  suite: types.map(UrbitApp),
  recommended: types.array(UrbitApp),
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
    get dockAppIds() {
      return self.dock
        .slice()
        .sort((a, b) => (a.dockIndex || 0) - (b.dockIndex || 0))
        .map((app) => app.id);
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
    creating: types.optional(LoaderModel, { state: 'initial' }),
    join: types.optional(LoaderModel, { state: 'initial' }),
    selected: types.safeReference(SpaceModel),
    spaces: types.map(SpaceModel),
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
    getSpaceByChatPath(chatPath: string) {
      const pathArr = chatPath.split('/');
      const path = `/${pathArr[2]}/${pathArr[3]}`;
      return self.spaces.get(path);
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
    selectSpace(spacePath: string) {
      self.selected = self.spaces.get(spacePath);
      if (self.selected) {
        appState.setTheme(self.selected.theme);
        SpacesIPC.setSelectedSpace(spacePath);
      }
      return self.selected;
    },
    joinSpace: flow(function* (spacePath: string) {
      self.join.set('loading');
      try {
        const space = yield SpacesIPC.joinSpace(spacePath) as Promise<any>;
        self.join.set('loaded');
        return space;
      } catch (e) {
        console.error(e);
        self.join.set('error');
        // TODO notify user it failed
      }
    }),
    createSpace: flow(function* (newSpace: NewSpace) {
      self.creating.set('loading');
      try {
        const spacePath = yield SpacesIPC.createSpace(newSpace) as Promise<any>;
        const created = SpaceModel.create(
          castToSnapshot({
            ...newSpace,
            path: spacePath,
            theme: defaultTheme,
            stall: StallModel.create({}),
            docks: [],
          })
        );
        self.spaces.set(spacePath, created);
        self.selected = self.spaces.get(spacePath);
        if (self.selected) appState.setTheme(self.selected.theme);
        self.creating.set('loaded');
        return spacePath;
      } catch (e) {
        console.error(e);
        self.creating.set('error');
        // TODO notify user it failed
      }
    }),
    updateSpace: flow(function* (spacePath: string, space: SpaceModelType) {
      console.log(toJS(space));
      const oldSpace = self.spaces.get(spacePath);
      const updatedSpace = self.spaces.get(spacePath);
      if (!oldSpace || !updatedSpace) return;
      space.path = spacePath;
      updatedSpace.access = space.access;
      updatedSpace.description = space.description;
      updatedSpace.name = space.name;
      try {
        self.spaces.set(spacePath, updatedSpace);
        yield SpacesIPC.updateSpace(spacePath, space) as Promise<any>;
      } catch (e) {
        self.spaces.set(spacePath, oldSpace);
        console.error(e);
      }
    }),
    deleteSpace: flow(function* (spacePath: string) {
      const deletedSpace = self.spaces.get(spacePath);
      if (!deletedSpace) return;
      try {
        self.spaces.delete(spacePath);
        if (self.selected === self.spaces.get(spacePath)) {
          self.selected = self.ourSpace;
        }
        yield SpacesIPC.deleteSpace(spacePath) as Promise<any>;
      } catch (e) {
        console.error(e);
        self.spaces.set(spacePath, deletedSpace);
      }
    }),
    leaveSpace: flow(function* (spacePath: string) {
      const leftSpace = self.spaces.get(spacePath);
      if (!leftSpace) return;
      try {
        self.spaces.delete(spacePath);
        if (self.selected === self.spaces.get(spacePath)) {
          self.selected = self.ourSpace;
        }
        yield SpacesIPC.leaveSpace(spacePath) as Promise<any>;
      } catch (e) {
        console.error(e);
        self.spaces.set(spacePath, leftSpace);
      }
    }),

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
    setSubscriptionStatus: (
      newSubscriptionStatus: 'subscribed' | 'subscribing' | 'unsubscribed'
    ) => {
      self.subscription.set(newSubscriptionStatus);
    },
  }));

export type SpacesStoreType = Instance<typeof SpacesStore>;
