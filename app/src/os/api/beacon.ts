// @ts-nocheck
import { Conduit } from '@holium/conduit';
import {
  NotificationModelType,
  NotificationStoreType,
} from '../services/spaces/models/beacon';
import { CourierStoreType } from '../services/ship/models/courier';

export const BeaconApi = {
  // get new notifications (anything not yet read/seen)
  getAll: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'realm-beacon',
      path: `/all`,
    });
    return response.all;
  },
  // get new notifications (anything not yet read/seen)
  getUnseen: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'realm-beacon',
      path: `/unseen`,
    });
    return response.unseen;
  },
  // get new notifications (anything not yet read/seen)
  getSeen: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'realm-beacon',
      path: `/seen`,
    });
    return response.seen;
  },
  // mark notification as seen
  markSeen: async (conduit: Conduit, noteId: string): Promise<any> => {
    conduit.poke({
      app: 'realm-beacon',
      mark: 'realm-beacon-action',
      json: {
        seen: { id: noteId },
      },
      onError: (e: any) => {
        console.error(e);
      },
    });
  },
  watchUpdates: (conduit: Conduit, beacon: NotificationStoreType) => {
    conduit.watch({
      app: 'realm-beacon',
      path: '/updates',
      onEvent: async (data: any, id?: number, mark?: string) => {
        console.log(data, mark);
        if ('new-note' in data) {
          beacon.newNotification(data['new-note']);
        } else if ('seen' in data) {
          beacon._markSeen(data['seen']);
        }
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
};
