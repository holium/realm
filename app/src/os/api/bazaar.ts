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
    conduit.watch({
      app: 'docket',
      path: `/charges`,
      onEvent: async (data: any, _id?: number, mark?: string) => {
        console.log('docket/charges => %o', { mark, data });
        if (mark === 'charge-update') {
          handleDocketReactions(data, state);
        }
      },
      onError: () => console.log('subscription [docket/charges] rejected'),
      onQuit: () => console.log('kicked from subscription [docket/charges]'),
    });
    conduit.watch({
      app: 'treaty',
      path: `/treaties`,
      onEvent: async (data: any, _id?: number, mark?: string) => {
        console.log('treaty/treaties => %o', { mark, data });
        if (mark === 'treaty-update-0') {
          handleTreatyReactions(data, state);
        }
      },
      onError: () => console.log('subscription [treaty/treaties] rejected'),
      onQuit: () => console.log('kicked from subscription [treaty/treaties]'),
    });
    conduit.watch({
      app: 'treaty',
      path: `/allies`,
      onEvent: async (data: any, _id?: number, mark?: string) => {
        console.log('treaty/allies => %o', { mark, data });
        if (mark === 'ally-update-0') {
          handleAllyReactions(data, state);
        }
      },
      onError: () => console.log('subscription [treaty/treaties] rejected'),
      onQuit: () => console.log('kicked from subscription [treaty/treaties]'),
    });
    conduit.watch({
      app: 'bazaar',
      path: `/updates`,
      onEvent: async (data: any, _id?: number, mark?: string) => {
        console.log('bazaar/updates => %o', { mark, data });
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

const handleDocketReactions = (data: any, state: BazaarStoreType) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    // docket/charges => {
    //   mark: 'charge-update',
    //   data: {
    //     'add-charge': {
    //       desk: 'hello',
    //       charge: {
    //         image: 'https://media.urbit.org/guides/additional/dist/wut.svg',
    //         title: 'Hello',
    //         license: 'MIT',
    //         version: '0.0.1',
    //         website: 'https://developers.urbit.org/guides/additional/dist/guide',
    //         href: { glob: [Object] },
    //         chad: { glob: null },
    //         color: '0x81.88c9',
    //         info: 'A simple hello world app.'
    //       }
    //     }
    //   }
    // }
    default:
      // unknown
      break;
  }
};

const handleTreatyReactions = (data: any, state: BazaarStoreType) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    // treaty/treaties => {
    //   mark: 'treaty-update-0',
    //   data: {
    //     add: {
    //       cass: { da: '~2022.8.30..03.58.44..aa63' },
    //       image: 'https://media.urbit.org/guides/additional/dist/wut.svg',
    //       title: 'Hello',
    //       license: 'MIT',
    //       version: '0.0.1',
    //       desk: 'hello',
    //       website: 'https://developers.urbit.org/guides/additional/dist/guide',
    //       ship: '~bus',
    //       href: { glob: { 'glob-reference': [Object], base: 'hello' } },
    //       hash: '0v1b.gfkkd.52qip.tsuc6.ajbnc.hoeg6.jp911.1ufg3.f38bd.vv31n.k6tl3',
    //       color: '0x81.88c9',
    //       info: 'A simple hello world app.'
    //     }
    //   }
    // }
    case 'add':
      state.initialTreaties(data['add']);
      break;
    default:
      // unknown
      break;
  }
};

const handleAllyReactions = (data: any, state: BazaarStoreType) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    // treaty/allies => {
    //   mark: 'ally-update-0',
    //   data: { new: { alliance: [ '~bus/hello', [length]: 1 ], ship: '~bus' } }
    // }
    case 'new':
      state.addAlly(data['new']);
      break;
    default:
      // unknown
      break;
  }
};
