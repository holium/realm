import { Conduit } from '@holium/conduit';
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
    console.log('addAlly [os] => %o', ship);
    return new Promise((resolve, reject) => {
      conduit.poke({
        ...allyShip(ship),
        reaction: 'bazaar-reaction.add-tag',
        onReaction: (data: any) => {
          console.log('addAlly [os] onReaction => %o', data);
          resolve(data['add-tag']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  installDocket: async (conduit: Urbit, ship: string, desk: string) => {
    return new Promise((resolve, reject) => {
      conduit.poke({
        ...docketInstall(ship, desk),
        reaction: 'bazaar-reaction.add-tag',
        onReaction: (data: any) => {
          resolve(data['add-tag']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
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
    return new Promise((resolve, reject) => {
      conduit.poke({
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
        reaction: 'bazaar-reaction.add-tag',
        onReaction: (data: any) => {
          resolve(data['add-tag']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
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
    return new Promise((resolve, reject) => {
      conduit.poke({
        app: 'bazaar',
        mark: 'bazaar-action',
        json: {
          'remove-tag': {
            path: pathObj,
            'app-id': appId,
            tag: tag,
          },
        },
        reaction: 'bazaar-reaction.remove-tag',
        onReaction: (data: any) => {
          resolve(data['remove-tag']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
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
    return new Promise((resolve, reject) => {
      conduit.poke({
        app: 'bazaar',
        mark: 'bazaar-action',
        json: {
          'suite-add': {
            path: pathObj,
            'app-id': appId,
            rank: rank,
          },
        },
        reaction: 'bazaar-reaction.suite-add',
        onReaction: (data: any) => {
          resolve(data['suite-add']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  removeFromSuite: async (conduit: Conduit, path: SpacePath, appId: string) => {
    const pathArr = path.split('/');
    const pathObj = {
      ship: pathArr[1],
      space: pathArr[2],
    };
    return new Promise((resolve, reject) => {
      conduit.poke({
        app: 'bazaar',
        mark: 'bazaar-action',
        json: {
          'suite-add': {
            path: pathObj,
            'app-id': appId,
          },
        },
        reaction: 'bazaar-reaction.suite-remove',
        onReaction: (data: any) => {
          resolve(data['suite-remove']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
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
        conduit.closeChannel();
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
        conduit.closeChannel();
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
          handleBazaarReactions(data, state);
        }
      },
      onError: () => console.log('subscription [bazaar/updates] rejected'),
      onQuit: () => console.log('kicked from subscription [bazaar/updates]'),
    });
  },
};

const handleBazaarReactions = (data: any, state: BazaarStoreType) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    case 'initial':
      state.initial(data['initial']);
      // state.initialReaction(data['initial']);
      break;
    case 'ally-added':
      break;
    case 'ally-removed':
      break;
    case 'treaty-added':
      break;
    case 'treaty-removed':
      break;
    case 'app-added':
      break;
    case 'app-removed':
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
