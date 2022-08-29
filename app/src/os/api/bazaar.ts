import { Conduit } from '@holium/conduit';
import { Urbit } from './../urbit/api';
import { SpacePath } from '../types';
import { BazaarStoreType } from 'os/services/spaces/models/bazaar';
import { allyShip, docketInstall } from '@urbit/api';
import { cleanNounColor } from '../lib/color';
import _ from 'lodash';

export const BazaarApi = {
  getApps: async (conduit: Conduit, path: SpacePath, tag: string = 'all') => {
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
  getTreaties: async (conduit: Conduit, patp: string) => {
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
  addAlly: async (conduit: Conduit, ship: string) => {
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
  getAllies: async (conduit: Conduit, path: SpacePath) => {
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
    conduit: Conduit,
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
    conduit: Conduit,
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
  },
  removeFromSuite: async (conduit: Conduit, path: SpacePath, appId: string) => {
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
  loadTreaties: (conduit: Conduit, state: BazaarStoreType): void => {},
  watchUpdates: (conduit: Conduit, state: BazaarStoreType): void => {
    console.log('watching docket/charges...');
    conduit.watch({
      app: 'docket',
      path: `/charges`,
      onEvent: async (data: any, _id?: number, mark?: string) => {
        console.log(mark, data);
        // if (mark === 'bazaar-reaction') {
        //   handleSpacesReactions(data, state, membersState, bazaarState);
        // }
      },
      onError: () => console.log('subscription [docket/charges] rejected'),
      onQuit: () => console.log('kicked from subscription [docket/charges]'),
    });
    console.log('watching treaty/treaties...');
    conduit.watch({
      app: 'treaty',
      path: `/treaties`,
      onEvent: async (data: any, _id?: number, mark?: string) => {
        console.log(mark, data);
        // if (mark === 'bazaar-reaction') {
        //   handleSpacesReactions(data, state, membersState, bazaarState);
        // }
      },
      onError: () => console.log('subscription [treaty/treaties] rejected'),
      onQuit: () => console.log('kicked from subscription [treaty/treaties]'),
    });
    console.log('watching bazaar/updates...');
    conduit.watch({
      app: 'bazaar',
      path: `/updates`,
      onEvent: async (data: any, _id?: number, mark?: string) => {
        console.log(mark, data);
        if (mark === 'bazaar-reaction') {
          handleBazaarReactions(data[mark], state);
        }
      },
      onError: () => console.log('subscription [bazaar/updates] rejected'),
      onQuit: () => console.log('kicked from subscription [bazaar/updates]'),
    });
  },
};

const handleBazaarReactions = (data: any, state: BazaarStoreType) => {
  const reaction: string = Object.keys(data)[0];
  console.log(reaction);
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
      }
      break;
    default:
      // unknown
      break;
  }
};
