import { types, Instance, flow } from 'mobx-state-tree';
import { Conduit } from '@holium/conduit';
import { BeaconApi } from 'os/api/beacon';
import {
  NotificationProviders,
  NotificationProviderFactory,
  INotificationProvider,
} from 'os/providers/notifications';

// set the default notification provider to the default notification provider (mock)
let activeProvider: INotificationProvider | null = null;

function getActiveProvider(): INotificationProvider {
  if (activeProvider) return activeProvider;
  return NotificationProviderFactory.create(NotificationProviders.Default);
}

export const NotificationModel = types
  .model('BeaconNotificationModel', {
    // markdown
    content: types.string,
    // has this notification been seen?
    seen: types.boolean,
    time: types.number,
  })
  .actions((self) => ({}));

export const NotificationStore = types
  .model('BeaconNotificationStore', {
    activeProvider: types.optional(types.string, NotificationProviders.Beacon),
    providers: types.array(types.string),
    latest: types.array(NotificationModel),
  })
  .actions((self) => ({
    loadProviders: flow(function* (conduit: Conduit) {
      self.providers.clear();
      try {
        self.providers = yield BeaconApi.getProviders(conduit);
      } catch (error) {
        console.error(error);
      }
    }),
    fetchRecent: flow(function* (conduit: Conduit) {
      try {
        self.latest = yield BeaconApi.getLatest(conduit, self.activeProvider);
      } catch (error) {
        console.error(error);
      }
    }),
  }));

export type NotificationModelType = Instance<typeof NotificationModel>;
