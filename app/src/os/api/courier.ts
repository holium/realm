import { Conduit } from '@holium/conduit';
import { createPost } from '@urbit/api';
import { patp2dec } from 'urbit-ob';
import { CourierStoreType } from '../services/ship/models/courier';
import { Patp } from '../types';

export const CourierApi = {
  getDMList: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'courier',
      path: `/dms`,
    });
    return response['inbox'];
  },
  getDMLog: async (to: Patp, conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'courier',
      path: `/dms/${to}`,
    });
    return response['dm-log'];
  },
  dmUpdates: (conduit: Conduit, store: CourierStoreType): Promise<any> => {
    return conduit.watch({
      app: 'courier',
      path: `/updates`,
      onEvent: async (data: any) => {
        const [action, payload] = Object.entries<any>(data)[0];
        switch (action) {
          case 'previews':
            store.setPreviews(payload);
            break;
          case 'dm-received':
            store.setReceivedDM(payload);
            break;
          default:
            console.log('action', action);
            break;
        }

        // store.
      },
      onError: (id, err) => {
        console.log(err);
        console.log('Subscription rejected');
      },
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
  // Pending dms
  sendDM: async (
    conduit: Conduit,
    ourShip: string,
    toShip: string, // how do you define the to ship?
    contents: any[]
  ) => {
    const post = createPost(
      ourShip.substring(1),
      contents,
      `/${patp2dec(`~${toShip}`)}`
    );

    const payload = {
      app: 'dm-hook',
      mark: `graph-update-3`,
      json: {
        'add-nodes': {
          resource: { ship: ourShip, name: 'dm-inbox' },
          nodes: {
            [post.index]: {
              post,
              children: null,
            },
          },
        },
      },
    };
    return await conduit.poke(payload);
  },
  acceptDm: async (conduit: Conduit, toShip: string) => {
    console.log('accepting dm');
    const payload = {
      app: 'dm-hook',
      mark: 'dm-hook-action',
      json: {
        accept: toShip,
      },
    };
    return await conduit.poke(payload);
  },
  declineDm: async (conduit: Conduit, toShip: string) => {
    const payload = {
      app: 'dm-hook',
      mark: 'dm-hook-action',
      json: {
        decline: toShip,
      },
    };
    return await conduit.poke(payload);
  },
  setScreen: async (
    conduit: Conduit,
    screen: boolean // should we screen dms from randos
  ) => {
    const payload = {
      app: 'dm-hook',
      mark: 'dm-hook-action',
      json: {
        screen,
      },
    };
    return await conduit.poke(payload);
  },
};
