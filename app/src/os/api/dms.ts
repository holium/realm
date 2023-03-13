import { Conduit } from '@holium/conduit';
import { createPost } from '@urbit/api';
import { CourierStoreType } from 'os/services/ship/models/courier';
import { patp2dec } from 'urbit-ob';

export const DmApi = {
  getDMs: async (ship: string, conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'graph-store',
      path: `/graph/${ship}/dm-inbox`,
    });
    return response['graph-update']['add-graph'].graph;
  },
  updates: async (conduit: Conduit, store: CourierStoreType): Promise<any> => {
    // const ship = `~${conduit.ship}`;
    return await conduit.watch({
      app: 'dm-hook',
      path: '/updates',
      onEvent: async (data: any) => {
        if (data['dm-hook-action']) {
          const [action, payload] = Object.entries<any>(
            data['dm-hook-action']
          )[0];
          switch (action) {
            case 'pendings':
              // const pendings: string[] = payload;
              // chatStore.setPendingDms(pendings);
              break;
            case 'screen':
              // console.log('screen set');
              // TODO handle screens setting
              // console.log(data);
              break;
            case 'accept':
              console.log('accept', payload);
              // const acceptedContact = `~${payload}`;
              // store.setNewPreview(`/dm-inbox/${acceptedContact}`, );
              // const response = await conduit.scry({
              //   app: 'graph-store',
              //   path: `/graph/${ship}/dm-inbox/${acceptedContact}`,
              // });
              // console.log('accept', response);
              // const chat = chatStore.dms.get(acceptedContact);
              // chat?.setDm(
              //   conduit.ship,
              //   response['graph-update']['add-graph']['graph']
              // );
              break;
            case 'decline':
              const declinedContact = `~${payload}`;
              console.log('decline', payload, `/dm-inbox/${declinedContact}`);
              store.rejectDmInvite();
              break;
            default:
              console.log('action', action);
              break;
          }
        }
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
  // graphUpdates: (conduit: Conduit, chatStore: ChatStoreType): Promise<any> => {
  //   return conduit.watch({
  //     app: 'graph-store',
  //     path: `/updates`,
  //     onEvent: async (data: any) => {
  //       console.log('graph update', data['graph-update']);
  //       if (data['graph-update']) {
  //         // const { resource, nodes } = data['graph-update']['add-nodes'];
  //         // if (resource.name === 'dm-inbox') {
  //         //   const { post } = Object.values<{ post: PostType }>(nodes)[0];
  //         //   const chatModel = chatStore.dms.get(post.author);
  //         //   chatModel?.setDm(conduit.ship, post);
  //         //   return;
  //         // }
  //       }
  //     },
  //     onError: () => console.log('Subscription rejected'),
  //     onQuit: () => console.log('Kicked from subscription'),
  //   });
  // },
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
    console.log('accepting dm', toShip);
    const payload = {
      app: 'dm-hook',
      mark: 'dm-hook-action',
      json: {
        accept: `~${toShip}`,
      },
    };
    return await conduit.poke(payload);
  },
  declineDm: async (conduit: Conduit, toShip: string) => {
    console.log('decline dm', toShip);

    const payload = {
      app: 'dm-hook',
      mark: 'dm-hook-action',
      json: {
        decline: `~${toShip}`,
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
  // getNewest(`~${window.ship}`, 'dm-inbox', 100, `/${patp2dec(ship)}`);
  // const aUpdated = a.startsWith('~')
  //   ?  (unreads?.[`/graph/~${window.ship}/dm-inbox/${patp2dec(a)}`]?.last || 0)
  // const bUpdated = b.startsWith('~')
  //   ?  (unreads?.[`/graph/~${window.ship}/dm-inbox/${patp2dec(b)}`]?.last || 0)
  //  getShallowChildren(`~${window.ship}`, 'dm-inbox');
  //
  //
  // getGroupDMs: async (ship: string, conduit: Urbit) => {
  //   // const response = await conduit.scry({
  //   //   app: 'graph-store',
  //   //   path: `/graph/${ship}/dm-inbox`,
  //   // });

  //   const keys = await conduit.scry({
  //     app: 'graph-store',
  //     path: `/keys`,
  //   });

  //   // const metadata = await conduit.scry({
  //   //   app: 'metadata-store',
  //   //   path: `/metadata`,
  //   // });

  //   // const response = await conduit.scry({
  //   //   app: 'graph-store',
  //   //   path: `/graph/${ship}/~2022.6.13..15.34.51`,
  //   // });
  //   // console.log(response['graph-update']['add-graph']);
  //   // const keys = responseKeys['graph-update']['keys'];
  //   // console.log('graph', metadata);
  //   return keys;
  // },
};
