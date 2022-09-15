import { Conduit } from '@holium/conduit';
import { SpacePath } from '../types';
import { BazaarStoreType } from 'os/services/spaces/models/bazaar';
import { allyShip, docketInstall } from '@urbit/api';
import { cleanNounColor } from '../lib/color';
import _ from 'lodash';

export const BazaarApi = {
  getApps: async (conduit: Conduit, path: SpacePath, tag: string = 'all') => {
    //  [host]/~/scry/bazaar/~zod/my-space/apps.json
    const response = await conduit.scry({
      app: 'bazaar',
      path: `${path}/apps/${tag}`, // the spaces scry is at the root of the path
    });
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
    return new Promise((resolve, reject) => {
      conduit.poke({
        ...allyShip(ship),
        reaction: 'bazaar-reaction.new-ally',
        onReaction: (data: any) => {
          console.log('addAlly [os] onReaction => %o', data);
          resolve(data['new-ally']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  installDocket: async (conduit: Conduit, ship: string, desk: string) => {
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
          'suite-remove': {
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
  pinApp: async (
    conduit: Conduit,
    path: SpacePath,
    appId: string,
    rank: number | null
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
          pin: {
            path: pathObj,
            'app-id': appId,
            rank: rank,
          },
        },
        reaction: 'bazaar-reaction.pin',
        onReaction: (data: any) => {
          resolve(data['pin']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  unpinApp: async (conduit: Conduit, path: SpacePath, appId: string) => {
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
          unpin: {
            path: pathObj,
            'app-id': appId,
          },
        },
        reaction: 'bazaar-reaction.unpin',
        onReaction: (data: any) => {
          resolve(data['unpin']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  recommendApp: async (conduit: Conduit, path: SpacePath, appId: string) => {
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
          recommend: {
            path: pathObj,
            'app-id': appId,
          },
        },
        reaction: 'bazaar-reaction.recommend',
        onReaction: (data: any) => {
          resolve(data['recommend']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  unrecommendApp: async (conduit: Conduit, path: SpacePath, appId: string) => {
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
          unrecommend: {
            path: pathObj,
            'app-id': appId,
          },
        },
        reaction: 'bazaar-reaction.unrecommend',
        onReaction: (data: any) => {
          resolve(data['unrecommend']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  setPinnedOrder: async (conduit: Conduit, path: SpacePath, order: any[]) => {
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
          'set-pin-order': {
            path: pathObj,
            order: order,
          },
        },
        reaction: 'bazaar-reaction.set-pin-order',
        onReaction: (data: any) => {
          resolve(data['set-pin-order']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  loadTreaties: (conduit: Conduit, state: BazaarStoreType): void => {},
  initialize: async (
    conduit: Conduit,
    state: BazaarStoreType
  ): Promise<void> => {
    // load allies
    const allies = await conduit.scry({
      app: 'treaty',
      path: '/allies', // the spaces scry is at the root of the path
    });
    state.initialAllies(allies.ini);
    conduit.watch({
      app: 'bazaar',
      path: `/updates`,
      onEvent: async (data: any, _id?: number, mark?: string) => {
        // console.log('bazaar/updates => %o', data);
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
      console.log('initial => %o', data['initial']);
      state.initial(data['initial']);
      // state.initialReaction(data['initial']);
      break;
    case 'ally-added':
      break;
    case 'ally-removed':
      break;
    case 'treaty-added':
      {
        let detail = data['treaty-added'];
        console.log(detail);
        // @ts-ignore
        state.addTreaty(detail);
      }
      break;
    case 'treaty-removed':
      break;
    case 'app-installed':
      {
        let detail = data['app-installed'];
        console.log('app-installed => %o', detail);
        state.addApp(detail['app-id'], {
          ...detail.app,
          id: detail['app-id'],
        });
        // console.log(detail);
        // console.log('app-installed');
        // @ts-ignore
        // TODO insert a new app here
        // state.spaces.get('/our/').addApp(detail);
      }
      break;
    case 'app-uninstalled':
      {
        let detail = data['app-uninstalled'];
        console.log(detail);
        // @ts-ignore
        state.removeApp(detail);
      }
      break;
    case 'pin':
      {
        console.log('pin reaction => %o', data);
        const detail = data['pin'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        // @ts-ignore
        state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.updatePinnedRank(app);
        state.getBazaar(space)?.setPinnedApps(app.sort);
      }
      break;
    case 'unpin':
      {
        const detail = data['unpin'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        // @ts-ignore
        state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.updatePinnedRank(app);
        state.getBazaar(space)?.setPinnedApps(app.sort);
      }
      break;
    case 'set-pin-order':
      {
        const detail = data['set-pin-order'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        // @ts-ignore
        state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.setPinnedApps(app.sort);
      }
      break;
    case 'recommend':
      {
        const detail = data['recommend'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        // @ts-ignore
        state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.updateRecommendedRank(app);
        state.getBazaar(space)?.setRecommendedApps(app.sort);
      }
      break;
    case 'unrecommend':
      {
        const detail = data['unrecommend'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        // @ts-ignore
        state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.updateRecommendedRank(app);
        state.getBazaar(space)?.setRecommendedApps(app.sort);
      }
      break;
    case 'suite-add':
      {
        const detail = data['suite-add'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        // @ts-ignore
        state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.updateSuiteRank(app);
        state.getBazaar(space)?.setSuiteApps(app.sort);
      }
      break;
    case 'suite-remove':
      {
        console.log('suite-remove [reaction] => %o', data);
        const detail = data['suite-remove'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.updateSuiteRank(app);
        state.getBazaar(space)?.setSuiteApps(app.sort);
      }
      break;
    default:
      // unknown
      break;
  }
};
