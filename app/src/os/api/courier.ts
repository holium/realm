import { Conduit } from '@holium/conduit';
import { Post } from '@urbit/api';
import { CourierStoreType } from '../services/ship/models/courier';
import { Patp } from '../types';

export const CourierApi = {
  getDMList: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'courier',
      path: `/dms`,
    });
    return response.inbox;
  },
  getDMLog: async (to: Patp, conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'courier',
      path: `/dms/${to}`,
    });
    return response['dm-log'];
  },

  dmUpdates: async (
    conduit: Conduit,
    store: CourierStoreType
  ): Promise<any> => {
    return await conduit.watch({
      app: 'courier',
      path: `/updates`,
      onEvent: async (data: any) => {
        // console.log(data);
        const [action, payload] = Object.entries<any>(data)[0];
        switch (action) {
          case 'previews':
            store.setPreviews(payload);
            break;
          case 'dm-received':
            store.setReceivedDM(payload);
            break;
          case 'group-dm-created':
            console.log('group-dm-created', payload);
            // if()
            store.setNewPreview(payload);
            break;
          case 'invite-dm':
            console.log('invited to dm', payload);
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
  sendDM: async (conduit: Conduit, path: string, post: Post) => {
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
  sendGroupDM: async (
    conduit: Conduit,
    path: string, // i.e. /~fes/~2022.8.31..18.41.37
    post: Post
  ) => {
    const split = path.split('/');
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
  createGroupDM: async (conduit: Conduit, ships: Patp[]) => {
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
  readDm: async (conduit: Conduit, ship: Patp) => {
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
  readGroupDm: async (conduit: Conduit, host: Patp, name: string) => {
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
  acceptDm: async (conduit: Conduit, toShip: string) => {
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
  declineDm: async (conduit: Conduit, toShip: string) => {
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
  acceptGroupDm: async (conduit: Conduit, inviteId: string) => {
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
  declineGroupDm: async (conduit: Conduit, inviteId: string) => {
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
