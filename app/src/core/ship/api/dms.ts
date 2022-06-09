import { Urbit } from './../../urbit/api';
import { quickPoke } from '../../lib/poke';
import { createPost } from '@urbit/api';
import { patp2dec } from 'urbit-ob';
import { ShipModelType } from '../stores/ship';

export const DmApi = {
  getDMs: async (ship: string, conduit: Urbit) => {
    const response = await conduit.scry({
      app: 'graph-store',
      path: `/graph/${ship}/dm-inbox`,
    });
    return response;
  },
  updates: (conduit: Urbit, shipState: ShipModelType) => {
    conduit.subscribe({
      app: 'dm-hook',
      path: '/updates',
      event: (data: any) => {
        if (data['dm-hook-action']) {
          const [action, payload] = Object.entries<any>(
            data['dm-hook-action']
          )[0];
          switch (action) {
            case 'pendings':
              const pendings: string[] = payload;
              console.log('pending dms', pendings);
              shipState.chat.setPendingDms(pendings);
              // TODO set pending dms
              break;
            case 'screen':
              console.log('screen set');
              break;
            default:
              break;
          }
        }
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
  // getNewest(`~${window.ship}`, 'dm-inbox', 100, `/${patp2dec(ship)}`);
  // const aUpdated = a.startsWith('~')
  //   ?  (unreads?.[`/graph/~${window.ship}/dm-inbox/${patp2dec(a)}`]?.last || 0)
  // const bUpdated = b.startsWith('~')
  //   ?  (unreads?.[`/graph/~${window.ship}/dm-inbox/${patp2dec(b)}`]?.last || 0)
  //  getShallowChildren(`~${window.ship}`, 'dm-inbox');
  sendDM: async (
    ourShip: string,
    toShip: string, // how do you define the to ship?
    contents: any,
    credentials: { url: string; cookie: string }
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
    const response = await quickPoke(ourShip, payload, credentials, {
      path: `/graph/${ourShip}/dm-inbox`,
    });
    console.log('response', response);
    return response;
    // console.log(response);
  },
};
