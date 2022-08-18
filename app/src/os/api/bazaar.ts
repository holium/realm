import { Urbit } from './../urbit/api';
import { SpacePath } from '../types';
import { BazaarStoreType } from 'os/services/spaces/models/bazaar';

export const BazaarApi = {
  getApps: async (conduit: Urbit, path: SpacePath) => {
    //  [host]/~/scry/bazaar/~zod/my-space/apps.json
    const response = await conduit.scry({
      app: 'bazaar',
      path: `${path}/apps`, // the spaces scry is at the root of the path
    });
    return response.apps;
  },
  getTreaties: async (conduit: Urbit, patp: string) => {
    //  [host]/~/scry/treaty/treaties/~bus.json
    const response = await conduit.scry({
      app: 'treaty',
      path: `/treaties/${patp}`, // the spaces scry is at the root of the path
    });
    return response.ini;
  },
  // leverage treaty /allies scry for now. allies are technically ship specific,
  //   so consider adding to ship service; however, thought it would be easier to
  //   maintain knowing all app related functions are managed by Bazaar service
  getAllies: async (conduit: Urbit, path: SpacePath) => {
    const response = await conduit.scry({
      app: 'treaty',
      path: '/allies', // the spaces scry is at the root of the path
    });
    return response.ini;
  },
  watchUpdates: (conduit: Urbit, state: BazaarStoreType): void => {
    conduit.subscribe({
      app: 'bazaar',
      path: `/updates`,
      event: async (data: any, id: string) => {
        if (data['bazaar-reaction']) {
          handleBazaarReactions(data['bazaar-reaction'], state, id);
        }
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
};

const handleBazaarReactions = (
  data: any,
  state: BazaarStoreType,
  id: string
) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    case 'initial':
      state.initialReaction(data['initial']);
      break;
    default:
      // unknown
      break;
  }
};
