// @ts-nocheck
import { action } from 'mobx';
import { types, Instance, flow } from 'mobx-state-tree';
import { Conduit } from '@holium/conduit';
import { BeaconApi } from '../../../api/beacon';

const NotificationContentTypes = types.union(
  { eager: true },
  types.model('ContentText', { text: types.string }),
  types.model('ContentShip', { ship: types.string }),
  types.model('ContentEmph', { emph: types.string })
);

const PlaceModel = types.model({
  desk: types.string,
  path: types.string,
});

export type PlaceModelType = Instance<typeof PlaceModel>;

const AllStatsModel = types.model('AllStats', {
  place: PlaceModel,
  stats: types.model({
    count: types.number,
    each: types.array(types.frozen()),
    last: types.number,
  }),
});
export type AllStatsModelType = Instance<typeof AllStatsModel>;

export const NotificationModel = types
  .model('BeaconNotificationModel', {
    id: types.identifier,
    desk: types.string,
    inbox: types.string,
    content: types.array(NotificationContentTypes),
    time: types.number,
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
    notes: types.map(NotificationModel),
    all: types.array(AllStatsModel),
    // recent: types.array(NotificationModel),
  })
  .views((self) => ({
    get seen() {
      return Array.from(self.notes.values())
        .filter((note: NotificationModelType) => {
          return note.seen;
        })
        .sort(
          (na: NotificationModelType, nb: NotificationModelType) =>
            na.time - nb.time
        );
    },
    get unseen() {
      return Array.from(self.notes.values())
        .filter((note: NotificationModelType) => {
          return !note.seen;
        })
        .sort(
          (na: NotificationModelType, nb: NotificationModelType) =>
            na.time - nb.time
        );
    },
  }))
  .actions((self) => ({
    load: flow(function* (conduit: Conduit) {
      try {
        let all = yield BeaconApi.getAll(conduit);
        Object.values(all)
          .sort((a: NotificationModelType, b: NotificationModelType) => {
            return b.time - a.time;
          })
          .forEach((note: NotificationModelType) =>
            self.notes.set(note.id, note)
          );
      } catch (error) {
        console.error(error);
      }
    }),
    newNotification(data: any) {
      if (data.con) {
        let contents = [];
        for (let i = 0; i < data.con.length; i++) {
          const content = data.con[i];
          if (typeof content === 'string') {
            contents.push({
              text: content,
            });
          } else {
            contents.push(content);
          }
        }
        self.unseen.push(
          NotificationModel.create({
            seen: false,
            time: data.time,
            content: contents,
            id: data.id,
          })
        );
      }
    },
    _markSeen: flow(function* (conduit: Conduit, noteId: string) {
      if (!self.notes.has(noteId)) return;
      const note = self.notes.get(noteId);
      self.notes.set(
        noteId,
        NotificationModel.create({
          ...note,
          seen: true,
        })
      );
    }),

    sawInbox: flow(function* (conduit: Conduit, inbox: BeaconInboxType) {
      try {
        if (Object.keys(inbox).includes('all')) {
          self.notes.forEach(
            action((note: NotificationModelType) => {
              note.seen = true;
            })
          );
        }
        return yield BeaconApi.sawInbox(conduit, inbox);
      } catch (error) {
        console.error(error);
      }
    }),
  }));

export type NotificationStoreType = Instance<typeof NotificationStore>;
