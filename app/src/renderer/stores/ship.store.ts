import { createContext, useContext } from 'react';
import { flow, Instance, onSnapshot, SnapshotIn, types } from 'mobx-state-tree';

import { BazaarStore, BazaarStoreType } from './models/bazaar.model';
import { LoaderModel } from './models/common.model';
import { FeaturedStore } from './models/featured.model';
import { FriendsStore } from './models/friends.model';
import { NotifStore } from './models/notification.model';
import { SpacesStore } from './models/spaces.model';
import { ChatStore } from './chat.store';
import { ShipIPC } from './ipc';

const ShipModel = types
  .model('ShipModel', {
    url: types.string,
    patp: types.identifier,
    cookie: types.string,
    nickname: types.maybeNull(types.string),
    color: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
  })
  .actions((self) => ({
    setMetadata(metadata: any) {
      self.nickname = metadata.nickname;
      self.color = metadata.color;
      self.avatar = metadata.avatar;
    },
  }));

export type ShipMobxType = Instance<typeof ShipModel>;

export const ShipStore = types
  .model('ShipStore', {
    ship: types.maybeNull(ShipModel),
    friends: FriendsStore,
    notifStore: NotifStore,
    chatStore: ChatStore,
    spacesStore: SpacesStore,
    bazaarStore: BazaarStore,
    featuredStore: FeaturedStore,
    loader: LoaderModel,
  })
  .actions((self) => ({
    setShip(ship: any) {
      window.ship = ship.patp;
      self.friends.init().then(() => {
        const myMeta = self.friends.getContactAvatarMetadata(ship.patp);
        if (myMeta) {
          self.ship?.setMetadata(myMeta);
        }
      });
      self.ship = ShipModel.create(ship);
      self.chatStore.init();
      self.spacesStore.init();
      self.bazaarStore.init();
    },
    reset() {
      self.ship = null;
      self.notifStore.reset();
      self.chatStore.reset();
      self.bazaarStore.reset();
      self.spacesStore.reset();
      self.friends.reset();
      self.featuredStore.reset();
    },
    getOurGroups: flow(function* () {
      try {
        return yield ShipIPC.getOurGroups() as Promise<any>;
      } catch (e) {
        console.error(e);
      }
    }),
    getGroup: flow(function* (path: string) {
      try {
        return yield ShipIPC.getGroup(path) as Promise<any>;
      } catch (e) {
        console.error(e);
      }
    }),
    getGroupMembers: flow(function* (path: string) {
      try {
        return yield ShipIPC.getGroupMembers(path) as Promise<any>;
      } catch (e) {
        console.error(e);
      }
    }),
  }));

// TODO better snapshot loading

const loadBazaarSnapshot = (): SnapshotIn<BazaarStoreType> => {
  const recentDevsSnapshot = localStorage.getItem('recentAppDevs');
  const recentAppsSnapshot = localStorage.getItem('recentApps');
  let recentDevs: string[] = [];
  let recentApps: string[] = [];
  if (recentDevsSnapshot) recentDevs = JSON.parse(recentDevsSnapshot);
  if (recentAppsSnapshot) recentApps = JSON.parse(recentAppsSnapshot);

  return {
    recentDevs: recentDevs || [],
    recentApps: recentApps || [],
    catalog: {},
  };
};

export const shipStore = ShipStore.create({
  notifStore: {
    notifications: [],
  },
  friends: {
    all: [],
  },
  chatStore: {
    subroute: 'inbox',
    isOpen: false,
    pinnedChats: [],
  },
  spacesStore: {
    spaces: {},
    loader: {
      state: 'loading',
    },
  },
  bazaarStore: loadBazaarSnapshot(),
  featuredStore: {
    spaces: {},
  },
  loader: {
    state: 'initial',
  },
});

onSnapshot(shipStore, (snapshot) => {
  localStorage.setItem(
    'recentApps',
    JSON.stringify(snapshot.bazaarStore.recentApps)
  );
  localStorage.setItem(
    'recentAppDevs',
    JSON.stringify(snapshot.bazaarStore.recentDevs)
  );
});
// -------------------------------
// Create core context
// -------------------------------
type ShipStoreInstance = Instance<typeof ShipStore>;
export const ShipStoreContext = createContext<null | ShipStoreInstance>(
  shipStore
);

export const AccountProvider = ShipStoreContext.Provider;
export function useShipStore() {
  const store = useContext(ShipStoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
