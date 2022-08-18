import { Urbit } from './../urbit/api';
import { quickPoke } from '../lib/poke';
import { toJS } from 'mobx';
import { createPost } from '@urbit/api';
import { patp2dec } from 'urbit-ob';
import { ShipModelType } from '../services/ship/models/ship';
import { PostType } from '../types';
import { ISession } from '../';

export const DmApi = {
  getDMs: async (ship: string, conduit: Urbit) => {
    const response = await conduit.scry({
      app: 'graph-store',
      path: `/graph/${ship}/dm-inbox`,
    });
    return response['graph-update']['add-graph']['graph'];
  },
  updates: (conduit: Urbit, shipState: ShipModelType) => {
    conduit.subscribe({
      app: 'dm-hook',
      path: '/updates',
      event: async (data: any) => {
        if (data['dm-hook-action']) {
          const [action, payload] = Object.entries<any>(
            data['dm-hook-action']
          )[0];
          switch (action) {
            case 'pendings':
              const pendings: string[] = payload;
              shipState.chat.setPendingDms(pendings);
              break;
            case 'screen':
              // console.log('screen set');
              // TODO handle screens setting
              // console.log(data);
              break;
            case 'accept':
              const acceptedContact = `~${payload.accept}`;
              const response = await conduit.scry({
                app: 'graph-store',
                path: `/graph/${shipState.patp}/dm-inbox/${acceptedContact}`,
              });
              const chat = shipState.chat.dms.get(acceptedContact);
              chat?.setDm(response['graph-update']['add-graph']['graph']);
              break;
            case 'decline':
              const declinedContact = `~${payload.decline}`;
              shipState.chat.dms.delete(declinedContact);
              break;
            default:
              console.log('action', action);
              break;
          }
        }
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription dm-hook-action'),
    });
  },
  graphUpdates: (conduit: Urbit, shipState: ShipModelType) => {
    conduit.subscribe({
      app: 'graph-store',
      path: `/updates`,
      event: async (data: any) => {
        if (data['graph-update']) {
          const { resource, nodes } = data['graph-update']['add-nodes'];
          if (resource.name === 'dm-inbox') {
            const { post } = Object.values<{ post: PostType }>(nodes)[0];
            const chatModel = shipState.chat.dms.get(post.author);
            chatModel?.setDm(post);
            return;
          }
        }
      },
      err: () => console.log('Subscription rejected'),
      quit: () =>
        console.log('Kicked from subscription graph-store /updates dm-inbox'),
    });
  },
  sendDM: async (
    ourShip: string,
    toShip: string, // how do you define the to ship?
    contents: any[],
    credentials: ISession
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
    return await quickPoke(ourShip, payload, credentials);
  },
  acceptDm: async (ourShip: string, toShip: string, credentials: ISession) => {
    console.log('accepting dm');
    const payload = {
      app: 'dm-hook',
      mark: 'dm-hook-action',
      json: {
        accept: `~${toShip}`,
      },
    };
    return await quickPoke(ourShip, payload, credentials);
  },
  declineDm: async (ourShip: string, toShip: string, credentials: ISession) => {
    const payload = {
      app: 'dm-hook',
      mark: 'dm-hook-action',
      json: {
        decline: `~${toShip}`,
      },
    };
    return await quickPoke(ourShip, payload, credentials);
  },
  setScreen: async (
    ourShip: string,
    screen: boolean, // should we screen dms from randos
    credentials: { url: string; cookie: string }
  ) => {
    const payload = {
      app: 'dm-hook',
      mark: 'dm-hook-action',
      json: {
        screen,
      },
    };
    return await quickPoke(ourShip, payload, credentials);
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
