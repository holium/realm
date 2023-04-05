import { createContext, useContext } from 'react';
import { Instance, types } from 'mobx-state-tree';
import { ChatStore } from '../apps/Courier/store';
import { NotifIPC, RealmIPC } from './ipc';
import { RealmUpdateTypes } from 'os/realm.types';
import { SpacesStore } from './models/spaces.model';
import { FriendsStore } from './models/friends.model';
import { NotifStore } from './models/notification.model';
import { BazaarStore } from './models/bazaar.model';

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

const ShipStore = types
  .model('ShipStore', {
    ship: types.maybeNull(ShipModel),
    friends: FriendsStore,
    notifStore: NotifStore,
    chatStore: ChatStore,
    spacesStore: SpacesStore,
    bazaarStore: BazaarStore,
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
    },
  }));

const pinnedChats = localStorage.getItem(`${window.ship}-pinnedChats`);

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
    pinnedChats: pinnedChats ? JSON.parse(pinnedChats) : [],
  },
  spacesStore: {
    spaces: {},
  },
  bazaarStore: {
    catalog: {},
  },
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

// updates
RealmIPC.onUpdate((_event: any, update: RealmUpdateTypes) => {
  if (update.type === 'booted') {
    if (update.payload.session) {
      shipStore.setShip(update.payload.session);
    }
  }
  if (update.type === 'authenticated') {
    shipStore.setShip(update.payload);
  }
});
NotifIPC.onUpdate(({ type, payload }: any) => {
  switch (type) {
    case 'notification-added':
      shipStore.notifStore.onNotifAdded(payload);
      if (
        shipStore.chatStore.isChatSelected(payload.path) &&
        payload.app === 'realm-chat'
      ) {
        shipStore.notifStore.readPath(payload.app, payload.path);
      }
      break;
    case 'notification-updated':
      shipStore.notifStore.onNotifUpdated(payload);
      break;
    case 'notification-deleted':
      shipStore.notifStore.onNotifDeleted(payload);
      break;
  }
});
