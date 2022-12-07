// @ts-nocheck
import { Conduit } from '@holium/conduit';
import {
  NotificationModelType,
  NotificationStoreType,
} from '../services/spaces/models/beacon';
import { CourierStoreType } from '../services/ship/models/courier';

export const BeaconApi = {
  // get new notifications (anything not yet read/seen)
  getLatest: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'beacon',
      path: `/latest`,
    });
    return response.latest;
  },
  updates: (
    conduit: Conduit,
    notifications: NotificationStoreType,
    courier: CourierStoreType
  ) => {
    conduit.watch({
      app: 'realm-beacon',
      path: '/updates',
      onEvent: async (data: any, id?: number, mark?: string) => {
        // console.log(data, mark);
        if (data.more) {
          // console.log(
          //   'unread notifications => %o',
          //   data['more'][0].timebox.notifications[1].body[0]
          // );
          notifications.setWatchUpdate(data);
          courier.setNotificationUpdates(data);
        }
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
};
