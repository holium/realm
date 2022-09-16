import { Conduit } from '@holium/conduit';
import { SpacePath } from '../types';
import { BazaarStoreType } from 'os/services/spaces/models/bazaar';
import { allyShip, docketInstall, docketUninstall } from '@urbit/api';
import { cleanNounColor } from '../lib/color';
import _ from 'lodash';

export const BazaarApi = {
  installApp: async (tempConduit: Conduit, ship: string, desk: string) => {
    return new Promise(async (resolve, reject) => {
      let subscriptionId: number = -1;
      await tempConduit.watch({
        app: 'docket',
        path: '/charges',
        onSubscribed: (subscription: number) => {
          subscriptionId = subscription;
        },
        onEvent: async (data: any, _id?: number, mark?: string) => {
          if (data.hasOwnProperty('add-charge')) {
            const charge = data['add-charge'].charge;
            // according to Tlon source, this determines when the app is fully installed
            if ('glob' in charge.chad || 'site' in charge.chad) {
              await tempConduit.unsubscribe(subscriptionId);
              resolve(data);
            }
          }
        },
        onError: () => {
          console.log('subscription [docket/charges] rejected');
          reject('subscription [docket/charges] rejected');
        },
        onQuit: () => {
          console.log('kicked from subscription [docket/charges]');
          reject('kicked from subscription [docket/charges]');
        },
      });
      await tempConduit.poke(docketInstall(ship, desk));
    });
  },
  addAlly: async (tempConduit: Conduit, ship: string) => {
    return new Promise(async (resolve, reject) => {
      let subscriptionId: number = -1;
      await tempConduit.watch({
        app: 'treaty',
        path: '/treaties',
        onSubscribed: (subscription: number) => {
          subscriptionId = subscription;
        },
        onEvent: async (data: any, _id?: number, mark?: string) => {
          if (data.hasOwnProperty('add')) {
            await tempConduit.unsubscribe(subscriptionId);
            resolve(data);
          }
        },
        onError: () => {
          console.log('subscription [treaty/treaties] rejected');
          reject('subscription [treaty/treaties] rejected');
        },
        onQuit: () => {
          console.log('kicked from subscription [treaty/treaties]');
          reject('kicked from subscription [treaty/treaties]');
        },
      });
      await tempConduit.poke(allyShip(ship));
    });
  },
  isAppInstalled: async (tempConduit: Conduit, ship: string, desk: string) => {
    const response = await tempConduit.scry({
      app: 'docket',
      path: '/charges', // the spaces scry is at the root of the path
    });
    return Object.keys(response.initial).includes(desk);
  },
  isAlly: async (tempConduit: Conduit, ship: string) => {
    const response = await tempConduit.scry({
      app: 'treaty',
      path: '/allies', // the spaces scry is at the root of the path
    });
    return Object.keys(response.ini).includes(ship);
  },
  hasTreaty: async (tempConduit: Conduit, ship: string, desk: string) => {
    try {
      const response = await tempConduit.scry({
        app: 'treaty',
        path: `/treaty/${ship}/${desk}`, // the spaces scry is at the root of the path
      });
      // assume undefined response means no treaty found. not sure how reliable
      //  this is, but scry method doesn't return error codes (e.g. 404)
      console.log('hasTreaty: testing treaty => %o', {
        ship,
        desk,
        response,
      });
      return response !== undefined;
    } catch (e) {
      console.log(e);
    }
    return;
  },
  installDesk: async (tempConduit: Conduit, ship: string, desk: string) => {
    return new Promise(async (resolve, reject) => {
      if (!(await BazaarApi.isAlly(tempConduit, ship))) {
        console.log('forming alliance with %o...', ship);
        await BazaarApi.addAlly(tempConduit, ship)
          .then((result) => {
            console.log('installing %o...', desk);
            BazaarApi.installApp(tempConduit, ship, desk)
              .then((result) => {
                console.log('app install complete');
                resolve(result);
              })
              .catch((e) => reject(e));
          })
          .catch((e) => reject(e));
      } else {
        console.log('checking if %o installed...', ship);
        if (!(await BazaarApi.isAppInstalled(tempConduit, ship, desk))) {
          console.log('installing %o...', desk);
          await BazaarApi.installApp(tempConduit, ship, desk)
            .then((result) => {
              console.log('app install complete');
              resolve(result);
            })
            .catch((e) => reject(e));
        }
        // nothing to do, Realm already installed
        resolve('done');
      }
    });
  },
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
  // addAlly: async (conduit: Conduit, ship: string) => {
  //   return new Promise((resolve, reject) => {
  //     conduit.poke({
  //       ...allyShip(ship),
  //       reaction: 'bazaar-reaction.new-ally',
  //       onReaction: (data: any) => {
  //         console.log('addAlly [os] onReaction => %o', data);
  //         resolve(data['new-ally']);
  //       },
  //       onError: (e: any) => {
  //         reject(e);
  //       },
  //     });
  //   });
  // },
  // in the case of standard app search/install, we will have the ship/desk
  //  information (treaty/ally), so simply leverage Tlon docketInstall to
  //   perform install on local ship
  installDocket: async (conduit: Conduit, ship: string, desk: string) => {
    return new Promise(async (resolve, reject) => {
      await BazaarApi.installApp(conduit, ship, desk);
      resolve('done');
    });
  },
  uninstallApp: async (conduit: Conduit, desk: string) =>
    await conduit.poke(docketUninstall(desk)),
  // in the case of space apps, all we have is the desk, since docket/glob
  //   data does not include host/source ship. therefore we request an install
  //   back to the space host which requires desk name only. space host will then
  //   resolve origin ship by scrying its own treaties
  resolveAppInstall: async (conduit: Conduit, app: any) => {
    return new Promise(async (resolve, reject) => {
      let ship = undefined;
      if (app.href.glob['glob-reference'].location.ames) {
        ship = app.href.glob['glob-reference'].location.ames;
      } else {
        const response = await conduit.scry({
          app: 'bazaar',
          path: `/sites/${app.id}`, // the spaces scry is at the root of the path
        });
        if (!response.sites || response.sites.length === 0) {
          console.error(`site for '${app.id}' not found.`);
          return;
        }
        if (response.sites && response.sites.length > 1) {
          console.warn(
            `multiple ship entries found for the '${app.id}' app. using top match '${response.sites[0].ship}'...`
          );
        }
        ship = response.directories[0].ship;
      }
      console.log('install app => %o...', { ship, desk: app.id });
      await BazaarApi.installDesk(conduit, ship, app.id);
      resolve('done');
      // conduit.poke({
      //   ...docketInstall(ship, app.id),
      //   reaction: 'bazaar-reaction.placeholder',
      //   onReaction: (data: any) => {
      //     console.log('docketInstall => %o', data);
      //     resolve(data);
      //   },
      //   onError: (e: any) => {
      //     reject(e);
      //   },
      // });
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
      console.log('initial => %o', data);
      state.initial(data['initial']);
      // state.initialReaction(data['initial']);
      break;
    case 'ally-added':
      break;
    case 'ally-removed':
      break;
    case 'treaty-added':
      {
        console.log('treaty-added => %o', data);
        let detail = data['treaty-added'];
        // console.log(detail);
        // @ts-ignore
        state.addTreaty(detail);
      }
      break;
    case 'treaty-removed':
      break;
    case 'app-installed':
      {
        console.log('app-installed => %o', data);
        let detail = data['app-installed'];
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
        console.log('app-uninstalled => %o', data);
        let detail = data['app-uninstalled'];
        // @ts-ignore
        state.setUninstalled(detail['app-id']);
      }
      break;
    case 'pin':
      {
        console.log('pin => %o', data);
        // console.log('pin reaction => %o', data);
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
        console.log('unpin => %o', data);
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
        console.log('set-pin-order => %o', data);
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
        console.log('recommend => %o', data);
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
        console.log('unrecommend => %o', data);
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
        console.log('suite-add => %o', data);
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
        console.log('suite-remove => %o', data);
        // console.log('suite-remove [reaction] => %o', data);
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
