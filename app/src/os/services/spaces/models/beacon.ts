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
  .views((self) => ({
    // get seenSorted() {
    //   return self.seen.sort(
    //     (a: NotificationModelType, b: NotificationModelType) => {
    //       return a.time - b.time;
    //     }
    //   );
    // },
    // get unseenSorted() {
    //   return self.unseen.sort(
    //     (a: NotificationModelType, b: NotificationModelType) => {
    //       return a.time - b.time;
    //     }
    //   );
    // },
    // get seen() {
    //   return Array.from(self.notes.values())
    //     .filter((note: NotificationModelType) => {
    //       return note.seen;
    //     })
    //     .sort(
    //       (na: NotificationModelType, nb: NotificationModelType) =>
    //         na.time > nb.time
    //     );
    // },
    // get unseen() {
    //   return Array.from(self.notes.values())
    //     .filter((note: NotificationModelType) => {
    //       return !note.seen;
    //     })
    //     .sort(
    //       (na: NotificationModelType, nb: NotificationModelType) =>
    //         na.time > nb.time
    //     );
    // },
  }))
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
        // Object.values(all)
        // .sort((a: NotificationModelType, b: NotificationModelType) => {
        //   return a.time > b.time;
        // })
        //   .forEach((note: NotificationModelType) =>
        //     self.notes.set(note.id, note)
        //   );
      } catch (error) {
        console.error(error);
      }
    }),
    newNotification(data: any) {
      const notif = NotificationModel.create(data);
      const added = self.unseen;
      added.unshift(notif);
      self.unseen = added;
      // if (data.content) {
      //   const contents = [];
      //   for (let i = 0; i < data.content.length; i++) {
      //     const content = data.content[i];
      //     if (typeof content === 'string') {
      //       contents.push({
      //         text: content,
      //       });
      //     } else {
      //       contents.push(content);
      //     }
      //   }
      //   self.unseen.push(
      //     NotificationModel.create({
      //       ...data,
      //       content: contents,
      //     })
      //   );
      // }
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
      // nowSeen.seen = true;
      // self.unseen.splice();
      // if (!self.notes.has(noteId)) return;
      // const note = self.notes.get(noteId);
      // self.notes.set(
      //   noteId,
      //   NotificationModel.create({
      //     ...note,
      //     seen: true,
      //   })
      // );
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
          // self.seen = [...readUnseen, ...self.seen];
        }
        return yield BeaconApi.sawInbox(conduit, inbox);
      } catch (error) {
        console.error(error);
      }
    }),
  }));

export type NotificationStoreType = Instance<typeof NotificationStore>;
