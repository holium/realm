// @ts-nocheck
import { types, Instance, flow } from 'mobx-state-tree';
import { Conduit } from '@holium/conduit';
import { BeaconApi } from '../../../api/beacon';

const NotificationContentTypes = types.union(
  { eager: true },
  types.model('ContentText', { text: types.string }),
  types.model('ContentShip', { ship: types.string }),
  types.model('ContentEmph', { emph: types.string })
);

export const NotificationModel = types
  .model('BeaconNotificationModel', {
    id: types.identifier,
    desk: types.string,
    inbox: types.string,
    content: types.array(NotificationContentTypes),
    time: types.number,
    type: types.enumeration(['hark', 'realm']),
    seen: types.boolean,
  })
  .actions((self) => ({
    markSeen: flow(function* (conduit: Conduit) {
      try {
        yield BeaconApi.markSeen(conduit, self.id);
        self.seen = true;
      } catch (e) {
        console.error(e);
      }
    }),
  }));

export type NotificationModelType = Instance<typeof NotificationModel>;

export const NotificationStore = types
  .model('BeaconNotificationStore', {
    seen: types.array(NotificationModel),
    unseen: types.array(NotificationModel),
    notes: types.map(NotificationModel),
  })
  .actions((self) => ({
    load: flow(function* (conduit: Conduit) {
      try {
        const all = yield BeaconApi.getAll(conduit);
        const unseen = Object.values(all)
          .filter((note: NotificationModelType) => !note.seen)
          .sort((a: NotificationModelType, b: NotificationModelType) => {
            return b.time - a.time;
          });
        const seen = Object.values(all)
          .filter((note: NotificationModelType) => note.seen)
          .sort((a: NotificationModelType, b: NotificationModelType) => {
            return b.time - a.time;
          });
        self.unseen = unseen;
        self.seen = seen;
      } catch (error) {
        console.error(error);
      }
    }),
    newNotification(data: any) {
      const notif = NotificationModel.create(data);
      const added = self.unseen;
      added.unshift(notif);
      self.unseen = added;
    },
    _markSeen(noteId: string) {
      console.log('marking seen', noteId);
      const removed = self.unseen;
      const seenIdx = self.unseen.findIndex(
        (note: NotificationModelType) => note.id === noteId
      );
      self.seen.push(self.unseen[seenIdx]);
      removed.splice(seenIdx, 1);
      self.unseen = removed;
    },
    _sawInbox(payload: { desk: string; inbox: string }) {
      const seen = self.seen;
      let deskInbox = payload.inbox;
      if (payload.inbox.includes('club') && payload.desk === 'talk') {
        deskInbox = payload.inbox.replace('club', 'dm');
      }
      const readUnseen = self.unseen.filter((note: NotificationModelType) => {
        return note.inbox === deskInbox;
      });
      const unreadUnseen = self.unseen.filter((note: NotificationModelType) => {
        return note.inbox !== deskInbox;
      });
      self.unseen = unreadUnseen;
      seen.concat(readUnseen);
      self.seen = seen;
    },
    sawInbox: flow(function* (conduit: Conduit, inbox: BeaconInboxType) {
      try {
        if (Object.keys(inbox).includes('all')) {
          const seen = self.seen;
          const readUnseen = self.unseen.map((note: NotificationModelType) => {
            return {
              ...note,
              seen: true,
            };
          });
          self.unseen = [];
          seen.concat(readUnseen);
          self.seen = seen;
        }
        return yield BeaconApi.sawInbox(conduit, inbox);
      } catch (error) {
        console.error(error);
      }
    }),
  }));

export type NotificationStoreType = Instance<typeof NotificationStore>;
