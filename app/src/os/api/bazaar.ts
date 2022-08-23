import { Urbit } from './../urbit/api';
import { SpacePath } from '../types';
import {
  BazaarModelType,
  BazaarStoreType,
} from 'os/services/spaces/models/bazaar';
import { docketInstall } from '@urbit/api';
import { quickPoke } from '../lib/poke';
import { ISession } from '../';
import { cleanNounColor } from '../lib/color';
import _ from 'lodash';

const pendingRequests: { [key: string]: (data?: any) => any } = {};

export const BazaarApi = {
  getApps: async (conduit: Urbit, path: SpacePath, tag: string = 'all') => {
    //  [host]/~/scry/bazaar/~zod/my-space/apps.json
    const response = await conduit.scry({
      app: 'bazaar',
      path: `${path}/apps/${tag}`, // the spaces scry is at the root of the path
    });
    console.log('getApps before => %o', response.apps);
    const appMap = response.apps || {};
    Object.keys(appMap).forEach((appKey: string) => {
      if (appMap[appKey].color) {
        const appColor = appMap[appKey].color;
        appMap[appKey].color = appColor && cleanNounColor(appColor);
      }
    });
    // const sorted = Object.entries(appMap).sort(
    //   (a, b) =>
    //     _.toInteger(a[1].default?.rank) - _.toInteger(b[1].default?.rank)
    // );
    // return Object.fromEntries(sorted);
    console.log('getApp after => %o', appMap);
    return appMap;
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
    const pathArr = path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    await conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        'add-tag': {
          path: pathObj,
          'app-id': appId,
          tag: tag,
          rank: null,
        },
      },
    });
    return new Promise((resolve) => {
      pendingRequests['bazaar-action-add-app-tag'] = (data: any) => {
        console.log('resolving add-app-tag request');
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
    const pathArr = path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    await conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        'remove-tag': {
          path: pathObj,
          'app-id': appId,
          tag: tag,
        },
      },
    });
    return new Promise((resolve) => {
      pendingRequests['bazaar-action-remove-app-tag'] = (data: any) => {
        console.log('resolving bazaar-action-remove-app-tag');
        resolve(data);
      };
    });
  },
  watchUpdates: (conduit: Urbit, state: BazaarStoreType): void => {
    conduit.subscribe({
      app: 'bazaar',
      path: `/updates`,
      event: async (data: any, id: string) => {
        console.log(data);
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
  console.log(data);
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    case 'initial':
      state.initial(data['initial']);
      // state.initialReaction(data['initial']);
      break;
    case 'add-tag':
      {
        let detail = data['add-tag'];
        console.log(detail);
        // @ts-ignore
        state
          .getBazaar(detail['space-path'])
          .addAppTag(detail['app-id'], detail.tag);
        if (pendingRequests['bazaar-action-add-app-tag']) {
          pendingRequests['bazaar-action-add-app-tag'](detail);
          pendingRequests['bazaar-action-add-app-tag'] = () => {};
        }
      }
      break;
    case 'remove-tag':
      {
        const detail = data['remove-tag'];
        console.log('removing app tag => %o', {
          path: detail['space-path'],
          appId: detail['app-id'],
          tag: detail.tag,
        });
        // @ts-ignore
        state
          .getBazaar(detail['space-path'])
          .removeAppTag(detail['app-id'], detail.tag);
        if (pendingRequests['bazaar-action-remove-app-tag']) {
          pendingRequests['bazaar-action-remove-app-tag'](detail);
          pendingRequests['bazaar-action-remove-app-tag'] = () => {};
        }
      }
      break;
    default:
      // unknown
      break;
  }
};
