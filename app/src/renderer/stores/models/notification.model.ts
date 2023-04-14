// import { toJS } from 'mobx';
import { flow, Instance, types, applySnapshot } from 'mobx-state-tree';
import { NotifIPC } from '../ipc';

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

export const NotifStore = types
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
        yield NotifIPC.readNotification(app, path) as Promise<any>;
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
        yield NotifIPC.dismissNotification(app) as Promise<any>;
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
        yield NotifIPC.dismissNotification(app, path) as Promise<any>;
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

          yield NotifIPC.dismissNotification(
            notif.app,
            notif.path,
            id
          ) as Promise<any>;
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
