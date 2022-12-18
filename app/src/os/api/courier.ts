import { Conduit } from '@holium/conduit';
import { Post } from '@urbit/api';
import { CourierStoreType } from '../services/ship/models/courier';
import { Patp } from '../types';

type CourierApiType = {
  /* TODO: Typeset Counduit returns */
  getDmList: (conduit: Conduit) => Promise<any>;
  getDmLog: (conduit: Conduit, ship: Patp) => Promise<any>;
  dmUpdates: (conduit: Conduit, store: CourierStoreType) => Promise<any>;
  sendDm: (conduit: Conduit, path: string, post: Post) => Promise<number>;
  sendGroupDm: (conduit: Conduit, path: string, post: Post) => Promise<number>;
  createGroupDm: (conduit: Conduit, ships: Patp[]) => Promise<any>;
  readDm: (conduit: Conduit, ship: Patp) => Promise<any>;
  readGroupDm: (conduit: Conduit, host: Patp, name: string) => Promise<any>;
  acceptDm: (conduit: Conduit, toShip: string) => Promise<any>;
  declineDm: (conduit: Conduit, toShip: string) => Promise<any>;
  acceptGroupDm: (conduit: Conduit, inviteId: string) => Promise<any>;
  declineGroupDm: (conduit: Conduit, inviteId: string) => Promise<any>;
  setScreen: (conduit: Conduit, screen: boolean) => Promise<any>;
};

export const CourierApi: CourierApiType = {
  getDmList: async (conduit) => {
    const response = await conduit.scry({
      app: 'courier',
      path: `/dms`,
    });
    return response.inbox;
  },
  getDmLog: async (conduit, to) => {
    try {
      const response = await conduit.scry({
        app: 'courier',
        path: `/dms/${to}`,
      });
      return response['dm-log'];
    } catch (e) {
      console.log(e);
    }
  },

  dmUpdates: async (conduit, store) => {
    return await conduit.watch({
      app: 'courier',
      path: `/updates`,
      onEvent: async (data: any) => {
        const [action, payload] = Object.entries<any>(data)[0];
        switch (action) {
          case 'previews':
            store.setPreviews(payload);
            break;
          case 'dm-received':
            /* TODO: don't send this event to self */
            const self = `~${conduit.ship}`;
            const isFromSelf = payload.messages[0].author === self;
            if (isFromSelf) {
              store.setPreview(payload);
            } else {
              store.setReceivedDm(payload);
            }
            break;
          case 'group-dm-created':
            store.setNewPreview(payload);
            break;
          case 'invite-dm':
            store.setNewPreview(payload);
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
      onQuit: () => console.log('Kicked from courier subscription'),
    });
  },
  sendDm: async (conduit, path, post) => {
    const to = path.split('/')[2]; // /dm-inbox/<to @p>
    const payload = {
      app: 'courier',
      mark: `graph-dm-action`,
      json: {
        'send-dm': {
          ship: to,
          post,
        },
      },
    };
    return await conduit.poke(payload);
  },
  sendGroupDm: async (conduit, path, post) => {
    const split = path.split('/'); // Path example: /~fes/~2022.8.31..18.41.37
    const host = split[1];
    const timestamp = split[2];
    const payload = {
      app: 'courier',
      mark: `graph-dm-action`,
      json: {
        'send-group-dm': {
          resource: { ship: host, name: timestamp },
          post,
        },
      },
    };
    return await conduit.poke(payload);
  },
  createGroupDm: async (conduit, ships) => {
    return await new Promise((resolve, reject) => {
      conduit.poke({
        app: 'courier',
        mark: `graph-dm-action`,
        json: {
          'create-group-dm': {
            ships,
          },
        },
        reaction: 'graph-dm-reaction.group-dm-created',
        onReaction(data: any) {
          resolve(data);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  // Set read status
  readDm: async (conduit, ship) => {
    await conduit.poke({
      app: 'courier',
      mark: 'graph-dm-action',
      json: {
        'read-dm': {
          ship,
        },
      },
    });
  },
  readGroupDm: async (conduit, host, name) => {
    await conduit.poke({
      app: 'courier',
      mark: 'graph-dm-action',
      json: {
        'read-group-dm': {
          resource: { ship: host, name },
        },
      },
    });
  },
  // Dm invite flow
  acceptDm: async (conduit, toShip) => {
    console.log('accepting dm');
    const payload = {
      app: 'courier',
      mark: 'accept-dm',
      json: {
        accept: toShip,
      },
    };
    return await conduit.poke(payload);
  },
  declineDm: async (conduit, toShip) => {
    const payload = {
      app: 'courier',
      mark: 'accept-dm',
      json: {
        decline: toShip,
      },
    };
    return await conduit.poke(payload);
  },
  // Group invite flow
  acceptGroupDm: async (conduit, inviteId) => {
    const payload = {
      app: 'courier',
      mark: 'accept-group-dm',
      json: {
        accept: inviteId,
      },
    };
    console.log('accepting dm', payload);
    return await conduit.poke(payload);
  },
  declineGroupDm: async (conduit, inviteId) => {
    const payload = {
      app: 'invite-store',
      mark: 'invite-action',
      json: {
        decline: {
          term: 'graph',
          uid: inviteId,
        },
      },
    };
    return await conduit.poke(payload);
  },
  setScreen: async (conduit, screen) => {
    const payload = {
      app: 'dm-hook',
      mark: 'dm-hook-action',
      json: {
        screen, // should we screen dms from randos
      },
    };
    return await conduit.poke(payload);
  },
};
