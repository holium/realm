import { Urbit } from './../urbit/api';
import { SpacePath } from '../types';
import {
  BazaarModelType,
  BazaarStoreType,
} from 'os/services/spaces/models/bazaar';
import { allyShip, docketInstall } from '@urbit/api';
import { ISession } from '../';
import { cleanNounColor } from '../lib/color';
import _ from 'lodash';

const pendingRequests: { [key: string]: (data?: any) => any } = {};

export const BazaarApi = {
  getApps: async (conduit: Urbit, path: SpacePath, tag: string = 'all') => {
    //  [host]/~/scry/bazaar/~zod/my-space/apps.json
    console.log(`${path}/apps/${tag} => %`);
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
    const appMap = response.ini || {};
    Object.keys(appMap).forEach((appKey: string) => {
      if (appMap[appKey].color) {
        const appColor = appMap[appKey].color;
        appMap[appKey].color = appColor && cleanNounColor(appColor);
      }
    });
    return appMap;
  },
  addAlly: async (conduit: Urbit, ship: string) => {
    await conduit.poke(allyShip(ship));
    return new Promise((resolve) => {
      pendingRequests['bazaar-action-add-treaty'] = (data: any) => {
        console.log('resolving bazaar-action-add-treaty poke');
        resolve(data);
      };
    });
  },
  installDocket: async (conduit: Urbit, ship: string, desk: string) => {
    await conduit.poke(docketInstall(ship, desk));
    return new Promise((resolve) => {
      pendingRequests['bazaar-action-install-docket'] = (data: any) => {
        console.log('resolving bazaar-action-install-docket poke');
        resolve(data);
      };
    });
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
  addToSuite: async (
    conduit: Urbit,
    path: SpacePath,
    appId: string,
    rank: number
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
        'suite-add': {
          path: pathObj,
          'app-id': appId,
          rank: rank,
        },
      },
    });
    return new Promise((resolve) => {
      pendingRequests['bazaar-action-suite-add'] = (data: any) => {
        console.log('resolving add-to-suite request');
        resolve(data);
      };
    });
  },
  removeFromSuite: async (conduit: Urbit, path: SpacePath, appId: string) => {
    const pathArr = path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    await conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        'suite-remove': {
          path: pathObj,
          'app-id': appId,
        },
      },
    });
    return new Promise((resolve) => {
      pendingRequests['bazaar-action-suite-remove'] = (data: any) => {
        console.log('resolving suite-remove request');
        resolve(data);
      };
    });
  },
  loadTreaties: (conduit: Urbit, state: BazaarStoreType): void => {},
  watchUpdates: (conduit: Urbit, state: BazaarStoreType): void => {
    // get the scoop on new app installations
    conduit.subscribe({
      app: 'docket',
      path: `/charges`,
      event: async (data: any, id: string) => {
        console.log('docket/charges => %o', data);
      },
      err: () => console.log('subscription [docket/charges] rejected'),
      quit: () => console.log('kicked from [docket/charges] subscription'),
    });
    // get the scoop on new app installations
    conduit.subscribe({
      app: 'treaty',
      path: `/treaties`,
      event: async (data: any, id: string) => {
        console.log('treaty/treaties => %o', data);
        if (data.hasOwnProperty('add')) {
          state.addTreaty(data.add);
          if (pendingRequests['bazaar-action-add-treaty']) {
            pendingRequests['bazaar-action-add-treaty'](data);
            pendingRequests['bazaar-action-add-treaty'] = () => {};
          }
        }
      },
      err: () => console.log('subscription [docket/charges] rejected'),
      quit: () => console.log('kicked from [docket/charges] subscription'),
    });
    conduit.subscribe({
      app: 'bazaar',
      path: `/updates`,
      event: async (data: any, id: string) => {
        console.log(data);
        if (data['bazaar-reaction']) {
          handleBazaarReactions(data['bazaar-reaction'], state, id);
        }
      },
      err: () => console.log('subscription [bazaar/updates] rejected'),
      quit: () => console.log('kicked from [bazaar/updates] subscription'),
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
    case 'suite-add':
      {
        const detail = data['suite-add'];
        console.log('suite-add => %o', {
          path: detail['space-path'],
          appId: detail['app-id'],
          rank: detail.rank,
        });
        // @ts-ignore
        state
          .getBazaar(detail['space-path'])
          .addToSuite(detail['app-id'], detail.rank);
        if (pendingRequests['bazaar-action-suite-add']) {
          pendingRequests['bazaar-action-suite-add'](detail);
          pendingRequests['bazaar-action-suite-add'] = () => {};
        }
      }
      break;
    case 'suite-remove':
      {
        const detail = data['suite-remove'];
        console.log('suite-remove => %o', {
          path: detail['space-path'],
          appId: detail['app-id'],
        });
        // @ts-ignore
        state.getBazaar(detail['space-path']).removeFromSuite(detail['app-id']);
        if (pendingRequests['bazaar-action-suite-remove']) {
          pendingRequests['bazaar-action-suite-remove'](detail);
          pendingRequests['bazaar-action-suite-remove'] = () => {};
        }
      }
      break;
    default:
      // unknown
      break;
  }
};
