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
    // title: types.array(NotificationContentTypes),
    // markdown
    content: types.array(NotificationContentTypes),
    // has this notification been seen?
    seen: types.boolean,
    time: types.number,
  })
  .actions((self) => ({}));

export type NotificationModelType = Instance<typeof NotificationModel>;

export const NotificationStore = types
  .model('BeaconNotificationStore', {
    notes: types.map(NotificationModel),
    // unseen: types.array(NotificationModel),
    // seen: types.array(NotificationModel),
    all: types.array(AllStatsModel),
    // recent: types.array(NotificationModel),
  })
  .views((self) => ({
    get seen() {
      return Array.from(self.notes.values()).filter(
        (note: NotificationModelType) => {
          return note.seen;
        }
      );
    },
    get unseen() {
      return Array.from(self.notes.values()).filter(
        (note: NotificationModelType) => {
          return !note.seen;
        }
      );
    },
  }))
  .actions((self) => ({
    load: flow(function* (conduit: Conduit) {
      try {
        self.notes = yield BeaconApi.getAll(conduit);
        console.log(self.notes);
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
    markSeen: flow(function* (conduit: Conduit, noteId: string) {
      try {
        return yield BeaconApi.markSeen(conduit, noteId);
      } catch (error) {
        console.error(error);
      }
    }),
  }));

export type NotificationStoreType = Instance<typeof NotificationStore>;
