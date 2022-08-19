import { Urbit } from './../urbit/api';
import { SpacePath } from '../types';
import { BazaarStoreType } from 'os/services/spaces/models/bazaar';
import { docketInstall } from '@urbit/api';
import { quickPoke } from '../lib/poke';
import { ISession } from '../';
import { cleanNounColor } from '../lib/color';
import _ from 'lodash';

const pendingRequests: { [key: string]: (data?: any) => any } = {};

export const BazaarApi = {
  getApps: async (conduit: Urbit, path: SpacePath) => {
    //  [host]/~/scry/bazaar/~zod/my-space/apps.json
    const response = await conduit.scry({
      app: 'bazaar',
      path: `${path}/apps/all`, // the spaces scry is at the root of the path
    });
    const appMap = response.apps || {};
    Object.keys(appMap).forEach((appKey: string) => {
      if (appMap[appKey].docket) {
        const appColor = appMap[appKey].docket.color;
        appMap[appKey].docket.color = appColor && cleanNounColor(appColor);
      }
    });
    const sorted = Object.entries(appMap).sort(
      (a, b) => _.toInteger(a[1].rank) - _.toInteger(b[1].rank)
    );
    return Object.fromEntries(sorted);
  },
  getTreaties: async (conduit: Urbit, patp: string) => {
    //  [host]/~/scry/treaty/treaties/~bus.json
    const response = await conduit.scry({
      app: 'treaty',
      path: `/treaties/${patp}`, // the spaces scry is at the root of the path
    });
    return response.ini;
  },
  installDocket: async (
    ourShip: string,
    ship: string,
    desk: string,
    credentials: ISession
  ) => {
    return quickPoke(ourShip, docketInstall(ship, desk), credentials);
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
  addAppTag: async (
    conduit: Urbit,
    path: SpacePath,
    appId: string,
    tag: string
  ) => {
    await conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        'add-tag': {
          path: path,
          appId: appId,
          tag: tag,
        },
      },
    });
    return new Promise((resolve) => {
      pendingRequests['bazaar-action-add-app-tag'] = (data: any) => {
        resolve(data);
      };
    });
  },
  removeAppTag: async (
    conduit: Urbit,
    path: SpacePath,
    appId: string,
    tag: string
  ) => {
    await conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        'remove-tag': {
          path: path,
          appId: appId,
          tag: tag,
        },
      },
    });
    return new Promise((resolve) => {
      pendingRequests['bazaar-action-add-remove-tag'] = (data: any) => {
        resolve(data);
      };
    });
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
      // state.initialReaction(data['initial']);
      break;
    case 'tag-added':
      {
        let detail = data['tag-added'];
        console.log(detail);
        // @ts-ignore
        state.getBazaar(detail.path).addAppTag(detail.appId, detail.tag);
        if (pendingRequests['bazaar-action-add-app-tag']) {
          pendingRequests['bazaar-action-add-app-tag'](detail);
          pendingRequests['bazaar-action-add-app-tag'] = () => {};
        }
      }
      break;
    case 'tag-removed':
      {
        const detail = data['tag-removed'];
        console.log(detail);
        // @ts-ignore
        state.getBazaar(detail.path).removeAppTag(detail.appId, detail.tag);
        if (pendingRequests['bazaar-action-add-remove-tag']) {
          pendingRequests['bazaar-action-add-remove-tag'](detail);
          pendingRequests['bazaar-action-add-remove-tag'] = () => {};
        }
      }
      break;
    default:
      // unknown
      break;
  }
};
