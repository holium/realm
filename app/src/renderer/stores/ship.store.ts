import { createContext, useContext } from 'react';
// import { toJS } from 'mobx';
import { flow, Instance, types, applySnapshot } from 'mobx-state-tree';
import { NotifDBActions } from 'renderer/logic/actions/notif-db';
import { ChatStore, chatStore } from '../apps/Courier/store';
import { NotifIPC, RealmIPC } from './ipc';
import { Theme } from './models/Theme.model';
import { RealmUpdateTypes } from 'os/realm.service';
import { SpacesStore } from 'os/services/spaces/models/spaces';
import { FriendModel, FriendsStore } from './models/friends.model';

// const sortByUpdatedAt = (a: ChatModelType, b: ChatModelType) => {
//   return (
//     (b.updatedAt || b.metadata.timestamp) -
//     (a.updatedAt || a.metadata.timestamp)
//   );
// };

const NotificationButtonModel = types.model('NotificationButtonModel', {
  label: types.string,
  path: types.string,
  data: types.string,
  metadata: types.maybe(types.string),
});

export type NotifButtonMobxType = Instance<typeof NotificationButtonModel>;

const NotificationModel = types
  .model('NotificationModel', {
    id: types.number,
    app: types.string,
    path: types.string,
    type: types.string,
    title: types.string,
    content: types.maybeNull(types.string),
    image: types.maybeNull(types.string),
    buttons: types.maybeNull(types.array(NotificationButtonModel)),
    link: types.maybeNull(types.string),
    metadata: types.maybeNull(types.frozen()),
    pathMetadata: types.maybeNull(types.frozen()),
    createdAt: types.number,
    updatedAt: types.number,
    readAt: types.maybeNull(types.number),
    read: types.boolean,
    dismissedAt: types.maybeNull(types.number),
    dismissed: types.boolean,
  })
  .actions((self) => ({
    update(data: Instance<typeof self>) {
      applySnapshot(self, data);
    },
    markRead() {
      self.read = true;
      self.readAt = Date.now();
    },
    markDismissed() {
      self.dismissed = true;
      self.dismissedAt = Date.now();
    },
  }));

export type NotifMobxType = Instance<typeof NotificationModel>;

const NotifStore = types
  .model('NotifStore', {
    notifications: types.array(NotificationModel),
    unreadByPaths: types.map(types.number),
    unreadByApps: types.map(types.number),
  })
  .views((self) => ({
    get undismissedNotifications() {
      return self.notifications.filter((n) => !n.dismissed);
    },
    get unreadNotifications() {
      return self.notifications.filter((n) => !n.read);
    },
    get dismissedNotifications() {
      return self.notifications.filter((n) => n.dismissed);
    },
    get unreadCount() {
      return self.notifications.filter((n) => !n.read && !n.dismissed).length;
    },
    getUnreadCountByPath(path: string) {
      return self.unreadByPaths.get(path) || 0;
    },
    getUnreadCountByApp(app: string) {
      return self.unreadByApps.get(app) || 0;
    },
  }))
  .actions((self) => ({
    initNotifications: flow(function* () {
      try {
        const notifications = yield NotifIPC.getNotifications() as Promise<any>;
        self.unreadByPaths = notifications.reduce(
          (acc: Map<string, number>, n: NotifMobxType) => {
            if (!n.read) {
              acc.set(n.path, (acc.get(n.path) || 0) + 1);
            }
            return acc;
          },
          self.unreadByPaths
        );
        self.unreadByApps = notifications.reduce(
          (acc: Map<string, number>, n: NotifMobxType) => {
            if (!n.read) {
              acc.set(n.app, (acc.get(n.app) || 0) + 1);
            }
            return acc;
          },
          self.unreadByApps
        );

        self.notifications = notifications;
        return self.notifications;
      } catch (error) {
        console.error(error);
        return self.notifications;
      }
    }),
    readPath: flow(function* (app: string, path: string) {
      const unreadByPaths = self.unreadByPaths.get(path);

      try {
        self.notifications.forEach((n) => n.path === path && n.markRead());
        self.unreadByPaths.set(path, 0);
        yield NotifDBActions.readNotification(app, path);
      } catch (error) {
        console.error('readPath', error);
        self.unreadByPaths.set(path, unreadByPaths || 0);
      }
    }),

    dismissApp: flow(function* (app: string) {
      const unreadByApps = self.unreadByApps.get(app);

      try {
        self.unreadByApps.set(app, 0);
        self.notifications.forEach((n) => {
          if (n.app === app) {
            n.markDismissed();
          }
        });
        yield NotifDBActions.dismissNotification(app);
      } catch (error) {
        console.error(error);
        self.unreadByApps.set(app, unreadByApps || 0);
      }
    }),
    dismissPath: flow(function* (app: string, path: string) {
      const unreadByPaths = self.unreadByPaths.get(path);
      try {
        self.unreadByPaths.set(path, 0);
        self.notifications.forEach((n) => {
          if (n.app === app && n.path === path) {
            n.markDismissed();
          }
        });
        yield NotifDBActions.dismissNotification(app, path);
      } catch (error) {
        console.error(error);
        self.unreadByPaths.set(path, unreadByPaths || 0);
      }
    }),
    dismissOne: flow(function* (id: number) {
      const notif = self.notifications.find((n) => n.id === id);
      if (notif) {
        const unreadByApps = self.unreadByApps.get(notif.app);
        const unreadByPaths = self.unreadByPaths.get(notif.path);
        try {
          notif.markDismissed();
          const decUnreadByApps = unreadByApps ? unreadByApps - 1 : 0;
          const decUnreadByPaths = unreadByPaths ? unreadByPaths - 1 : 0;

          self.unreadByApps.set(notif.app, decUnreadByApps);
          self.unreadByPaths.set(notif.app, decUnreadByPaths);

          yield NotifDBActions.dismissNotification(notif.app, notif.path, id);
        } catch (error) {
          console.error(error);
          // if there's an error, revert the changes
          self.unreadByApps.set(notif.app, unreadByApps || 0);
          self.unreadByPaths.set(notif.app, unreadByPaths || 0);
        }
      }
    }),

    // onChangeHandlers
    onNotifAdded(notif: NotifMobxType) {
      self.notifications.push(notif);
      self.unreadByPaths.set(
        notif.path,
        (self.unreadByPaths.get(notif.path) || 0) + 1
      );
      self.unreadByApps.set(
        notif.app,
        (self.unreadByApps.get(notif.app) || 0) + 1
      );
    },
    onNotifUpdated(notif: NotifMobxType) {
      self.notifications.find((n) => n.id === notif.id)?.update(notif);
      // if the notification is read, decrement the unread count
      if (notif.read || notif.dismissed) {
        const unreadByApps = self.unreadByApps.get(notif.app);
        const unreadByPaths = self.unreadByPaths.get(notif.path);
        self.unreadByPaths.set(
          notif.path,
          unreadByPaths ? unreadByPaths - 1 : 0
        );
        self.unreadByApps.set(notif.app, unreadByApps ? unreadByApps - 1 : 0);
      }
    },
    onNotifDeleted(delId: number) {
      const notif = self.notifications.find((n) => n.id === delId);
      if (!notif) return;
      const index = self.notifications.indexOf(notif);
      if (index !== -1) {
        self.notifications.splice(index, 1);
      }
      // if the notification is not read, decrement the unread count
      if (!notif.read) {
        const unreadByApps = self.unreadByApps.get(notif.app);
        const unreadByPaths = self.unreadByPaths.get(notif.path);
        self.unreadByPaths.set(
          notif.path,
          unreadByPaths ? unreadByPaths - 1 : 0
        );
        self.unreadByApps.set(notif.app, unreadByApps ? unreadByApps - 1 : 0);
      }
    },

    reset() {
      self.notifications.clear();
    },
  }));

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
    spacesStore: types.optional(SpacesStore, {}),
    notifStore: NotifStore,
    chatStore: ChatStore,
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
});

// -------------------------------
// Create core context
// -------------------------------
type ShipStoreInstance = Instance<typeof ShipStore>;
export const ShipStoreContext =
  createContext<null | ShipStoreInstance>(shipStore);

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
  console.log('realm update', update);
  if (update.type === 'booted') {
    if (update.payload.session) {
      shipStore.setShip(update.payload.session);
    }
  }
  if (update.type === 'authenticated') {
    shipStore.setShip(update.payload);
  }
});
NotifDBActions.onDbChange((_evt, type, data) => {
  switch (type) {
    case 'notification-added':
      shipStore.notifStore.onNotifAdded(data);
      if (
        shipStore.chatStore.isChatSelected(data.path) &&
        data.app === 'realm-chat'
      ) {
        shipStore.notifStore.readPath(data.app, data.path);
      }
      break;
    case 'notification-updated':
      shipStore.notifStore.onNotifUpdated(data);
      break;
    case 'notification-deleted':
      shipStore.notifStore.onNotifDeleted(data);
      break;
  }
});
