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
      app: 'realm-beacon',
      path: `/latest`,
    });
    return response.latest;
  },
  watchUpdates: (conduit: Conduit, beacon: NotificationStoreType) => {
    conduit.watch({
      app: 'realm-beacon',
      path: '/updates',
      onEvent: async (data: any, id?: number, mark?: string) => {
        console.log(data, mark);
        if ('new-note' in data) {
          beacon.newNotification(data['new-note']);
        }
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
};
