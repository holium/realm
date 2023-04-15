import {
  Instance,
  types,
  flow,
  applySnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { LoaderModel, SubscriptionModel } from './common.model';
import { UrbitApp } from './bazaar.model';
import { MembersModel, MembersStore, VisaModel } from './invitations.model';
import { Theme, defaultTheme } from './theme.model';
import { BazaarIPC, SpacesIPC } from '../ipc';
import { appState } from '../app.store';
import { shipStore } from '../ship.store';

const spaceRowToModel = (space: any) => {
  return {
    ...space,
    members: {
      all: space.members.reduce((map: any, mem: any) => {
        map[mem.patp] = mem;
        return map;
      }, {}),
    },
  };
};

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
      console.log(self.dock, appId);
      return self.dock.some((app) => app.id === appId);
    },
    get dockAppIds() {
      return self.dock
        .slice()
        .sort((a, b) => (a.dockIndex || 0) - (b.dockIndex || 0))
        .map((app) => app.id);
    },
    isHost() {
      // TODO check if admin
      return self.path.includes(window.ship);
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
      // sort the dock apps by the dock id array
      const dockApps = self.dock.sort((a, b) => {
        const aIndex = dock.findIndex((appId) => appId === a.id);
        const bIndex = dock.findIndex((appId) => appId === b.id);
        return aIndex - bIndex;
      });

      try {
        applySnapshot(self.dock, dockApps);
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
    // addPinned(app: any) {
    //   self.dock.push(app);
    // },
    // removePinned(appId: string) {
    //   const index = self.dock.findIndex((app) => app.id === appId);
    //   self.dock.splice(index, 1);
    // },
    _setDock(dock: any) {
      self.dock = dock;
    },
    _setStall(stall: any) {
      self.stall = StallModel.create(stall);
    },
  }));

export type SpaceModelType = Instance<typeof SpaceModel>;

export const SpacesStore = types
  .model('SpacesStore', {
    loader: types.optional(LoaderModel, { state: 'loading' }),
    creating: types.optional(LoaderModel, { state: 'initial' }),
    join: types.optional(LoaderModel, { state: 'initial' }),
    selected: types.safeReference(SpaceModel),
    spaces: types.map(SpaceModel),
    invitations: types.optional(VisaModel, {
      outgoing: {},
      incoming: {},
    }),
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
          const spaceModel = SpaceModel.create(spaceRowToModel(space));
          self.spaces.set(space.path, spaceModel);
        });
        console.log(toJS(self.spaces));
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
    createSpace: flow(function* (newSpace: any) {
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
        if (self.selected === self.spaces.get(spacePath)) {
          appState.setTheme(self.ourSpace.theme);
          self.selected = self.ourSpace;
        }
        self.spaces.delete(spacePath);
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
        if (self.selected === self.spaces.get(spacePath)) {
          appState.setTheme(self.ourSpace.theme);
          self.selected = self.ourSpace;
        }
        self.spaces.delete(spacePath);
        yield SpacesIPC.leaveSpace(spacePath) as Promise<any>;
      } catch (e) {
        console.error(e);
        self.spaces.set(spacePath, leftSpace);
      }
    }),
    inviteMember: flow(function* (spacePath: string, patp: string) {
      const space = self.spaces.get(spacePath);
      if (!space) return;
      try {
        space.members.add(
          patp,
          MembersModel.create({
            alias: '',
            status: 'invited',
            roles: ['member'],
          })
        );
        yield SpacesIPC.inviteMember(spacePath, {
          patp,
          role: 'member',
          message: '',
        }) as Promise<any>;
      } catch (e) {
        console.error(e);
        space.members.remove(patp);
      }
    }),
    kickMember: flow(function* (spacePath: string, patp: string) {
      const space = self.spaces.get(spacePath);
      if (!space) return;
      const member = space.members.all.get(patp);
      try {
        space.members.remove(patp);
        yield SpacesIPC.kickMember(spacePath, patp) as Promise<any>;
      } catch (e) {
        console.error(e);
        space.members.add(patp, MembersModel.create(member));
      }
    }),
    setRoles: flow(function* (
      spacePath: string,
      patp: string,
      roles: string[]
    ) {
      try {
        yield SpacesIPC.setRoles(spacePath, patp, roles) as Promise<any>;
      } catch (e) {
        console.error(e);
      }
    }),

    // Setters
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
    // Data handler
    _onInitialInvitationsUpdate: (invitations: any) => {
      self.invitations.initialIncoming(invitations);
    },
    _onSpaceAdded: (addPayload: any) => {
      // Set pending space to loaded
      self.spaces.set(addPayload.path, spaceRowToModel(addPayload));
      // if the space is set to current, set it as selected
      const pendingAcceptLoader = self.invitations.pendingAccept.get(
        addPayload.path
      );
      if (pendingAcceptLoader) {
        pendingAcceptLoader.set('loaded');
        self.invitations.incoming.delete(addPayload.path);
      }
      if (addPayload.current) {
        self.selected = self.spaces.get(addPayload.path);
        if (self.selected) {
          appState.setTheme(self.selected.theme);
        }
      }
    },
    _onSpaceUpdated: (updatePayload: any) => {
      const space = self.spaces.get(updatePayload.path);
      if (!space) return;
      self.spaces.set(updatePayload.path, spaceRowToModel(updatePayload));
      if (updatePayload.theme !== space.theme) {
        const updatedTheme = self.spaces.get(updatePayload.path)?.theme;
        if (updatedTheme) {
          appState.setTheme(updatedTheme);
        }
      }
    },
    _onSpaceRemoved: (removePayload: any) => {
      if (!removePayload.path.includes(shipStore.ship?.patp)) {
        // TODO its not our space so we need to notify the user they were kicked
        console.warn('we were kicked from a space', removePayload.path);
      }
      if (self.selected === self.spaces.get(removePayload.path)) {
        appState.setTheme(self.ourSpace.theme);
        self.selected = self.ourSpace;
      }
      shipStore.spacesStore.spaces.delete(removePayload.path);
    },
    _onSpaceMemberAdded: (addPayload: any) => {
      const space = self.spaces.get(addPayload.path);
      if (!space) return;
      space.members.add(addPayload.ship, addPayload.member);
    },
    _onSpaceMemberUpdated: (updatePayload: any) => {
      const space = self.spaces.get(updatePayload.path);
      if (!space) return;
      space.members.update(updatePayload.ship, updatePayload.member);
    },
    _onSpaceMemberKicked: (kickPayload: any) => {
      const space = self.spaces.get(kickPayload.path);
      if (!space) return;
      space.members.remove(kickPayload.ship);
    },
    _onDockUpdate: (dockPayload: any) => {
      const space = self.spaces.get(dockPayload.path);
      if (!space) return;
      space._setDock(dockPayload.dock);
    },
    _onStallUpdate: (stallPayload: any) => {
      const space = self.spaces.get(stallPayload.path);
      if (!space) return;
      space._setStall(stallPayload.stall);
    },
  }));

export type SpacesStoreType = Instance<typeof SpacesStore>;
