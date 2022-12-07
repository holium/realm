// @ts-nocheck
import { types, Instance, flow } from 'mobx-state-tree';
import { Conduit } from '@holium/conduit';
import { BeaconApi } from 'os/api/beacon';

export const NotificationModel = types
  .model('BeaconNotificationModel', {
    // markdown
    content: types.string,
    // has this notification been seen?
    seen: types.boolean,
    time: types.number,
  })
  .actions((self) => ({}));

export type NotificationModelType = Instance<typeof NotificationModel>;

export const NotificationStore = types
  .model('BeaconNotificationStore', {
    latest: types.array(NotificationModel),
  })
  .actions((self) => ({
    fetchRecent: flow(function* (conduit: Conduit) {
      try {
        self.latest = yield BeaconApi.getLatest(conduit);
      } catch (error) {
        console.error(error);
      }
    }),
  }));

export type NotificationStoreType = Instance<typeof NotificationStore>;
