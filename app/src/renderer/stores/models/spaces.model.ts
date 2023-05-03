import {
  applySnapshot,
  castToSnapshot,
  clone,
  flow,
  getSnapshot,
  Instance,
  types,
} from 'mobx-state-tree';

import { MemberRole } from 'os/types';
import { defaultTheme } from 'renderer/lib/defaultTheme';

import { appState } from '../app.store';
import { BazaarIPC, SpacesIPC } from '../ipc';
import { shipStore } from '../ship.store';
import { UrbitApp } from './bazaar.model';
import { LoaderModel, SubscriptionModel } from './common.model';
import { MembersModel, MembersStore, VisaModel } from './invitations.model';
import { Theme } from './theme.model';

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

const createMembersToModel = (members: any) => {
  return {
    all: Object.entries(members).reduce(
      (map: any, entry: [patp: string, mem: any]) => {
        map[entry[0]] = {
          alias: entry[1].alias,
          roles: entry[1].roles,
          status: entry[1].status,
        };
        return map;
      },
      {}
    ),
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
      return self.dock.some((app) => app.id === appId);
    },
    get dockAppIds() {
      return self.dock.slice().map((app) => app.id);
    },
    isHost() {
      // TODO check if admin
      return self.path.includes(window.ship);
    },
    isAdmin() {
      // if host
      if (self.path.includes(window.ship)) return true;
      // check member
      const member = self.members.all.get(window.ship);
      if (!member) return false;
      return member.roles.includes('admin');
    },
  }))
  .actions((self) => ({
    setTheme: flow(function* (theme: any) {
      try {
        self.theme = clone(theme);
        yield SpacesIPC.updateSpace(self.path, getSnapshot(self));
      } catch (e) {
        console.error(e);
      }
    }),
    pinApp: flow(function* (appId: string) {
      try {
        return yield BazaarIPC.pinApp(self.path, appId, self.dock.length);
      } catch (error) {
        console.error(error);
      }
    }),
    unpinApp: flow(function* (appId: string) {
      try {
        return yield BazaarIPC.unpinApp(self.path, appId);
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
        return yield BazaarIPC.reorderPinnedApps(self.path, dock);
      } catch (error) {
        console.error(error);
      }
    }),
    addToSuite: flow(function* (appId: string, index: number) {
      try {
        return yield BazaarIPC.addToSuite(self.path, appId, index);
      } catch (error) {
        console.error(error);
      }
    }),
    removeFromSuite: flow(function* (index: number) {
      try {
        return yield BazaarIPC.removeFromSuite(self.path, index);
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
    loader: LoaderModel,
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
      try {
        const { current, spaces } = yield SpacesIPC.getInitial();
        spaces.forEach((space: any) => {
          space.theme.id = space.path;
          const spaceModel = SpaceModel.create(spaceRowToModel(space));
          self.spaces.set(space.path, spaceModel);
        });
        self.selected = self.spaces.get(current);
        if (self.selected) {
          appState.setTheme(self.selected.theme);
          self.loader.set('loaded');
        }
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
        const space = yield SpacesIPC.joinSpace(spacePath);
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
        const { spacePath, members }: { spacePath: string; members: any } =
          yield SpacesIPC.createSpace(newSpace);
        const created = SpaceModel.create(
          castToSnapshot({
            ...newSpace,
            path: spacePath,
            theme: defaultTheme,
            stall: StallModel.create({}),
            docks: [],
            members: createMembersToModel(members),
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
        return null;
      }
    }),
    updateSpace: flow(function* (spacePath: string, space: SpaceModelType) {
      const oldSpace = self.spaces.get(spacePath);
      const updatedSpace = self.spaces.get(spacePath);
      if (!oldSpace || !updatedSpace) return;
      space.path = spacePath;
      updatedSpace.access = space.access;
      updatedSpace.description = space.description;
      updatedSpace.name = space.name;
      updatedSpace.theme = clone(space.theme);
      try {
        self.spaces.set(spacePath, updatedSpace);
        yield SpacesIPC.updateSpace(spacePath, space);
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
        yield SpacesIPC.deleteSpace(spacePath);
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
        yield SpacesIPC.leaveSpace(spacePath);
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
        });
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
        yield SpacesIPC.kickMember(spacePath, patp);
      } catch (e) {
        console.error(e);
        space.members.add(patp, MembersModel.create(member));
      }
    }),
    setRoles: flow(function* (
      spacePath: string,
      patp: string,
      roles: MemberRole[]
    ) {
      try {
        yield SpacesIPC.setRoles(spacePath, patp, roles);
      } catch (e) {
        console.error(e);
      }
    }),
    reset() {
      self.spaces.clear();
      self.selected = undefined;
      self.loader.set('initial');
      self.join.set('initial');
      self.creating.set('initial');
      self.invitations.reset();
    },
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
      if (!removePayload.path.includes(appState.loggedInAccount?.serverId)) {
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
    _onJoinedBazaar: flow(function* (joinedPayload: any) {
      const space = self.spaces.get(joinedPayload.path);
      if (!space) return;
      space._setStall(joinedPayload.stall);
      const refreshedSpace = yield SpacesIPC.getSpace(joinedPayload.path);
      applySnapshot(space, spaceRowToModel(refreshedSpace));
    }),
  }));

export type SpacesStoreType = Instance<typeof SpacesStore>;
