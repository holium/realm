import { Conduit } from '@holium/conduit';
import { NotificationStoreType } from '../services/spaces/models/beacon';

export type BeaconInboxType =
  | { desk: string }
  | { group: string }
  | { all: null };

export const BeaconApi: any = {
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
  sawNote: async (conduit: Conduit, noteId: string): Promise<any> => {
    conduit.poke({
      app: 'realm-beacon',
      mark: 'realm-beacon-action',
      json: {
        'saw-note': { id: noteId },
      },
      onError: (e: any) => {
        console.error(e);
      },
    });
  },
  sawInbox: async (
    conduit: Conduit,
    payload: BeaconInboxType
  ): Promise<any> => {
    conduit.poke({
      app: 'realm-beacon',
      mark: 'realm-beacon-action',
      json: {
        'saw-inbox': payload,
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
      onEvent: async (data: any) => {
        if ('new-note' in data) {
          beacon.newNotification(data['new-note']);
        }
        if ('seen' in data) {
          beacon._markSeen(data['seen'].id);
        }

        if ('seen-inbox' in data) {
          beacon._sawInbox(data['seen-inbox']);
        }
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
};
