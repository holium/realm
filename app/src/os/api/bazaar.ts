import { Conduit } from '@holium/conduit';
import { SpacePath } from '../types';
import { BazaarStoreType } from 'os/services/spaces/models/bazaar';
import { allyShip, docketInstall, docketUninstall } from '@urbit/api';
import { cleanNounColor } from '../lib/color';
import _ from 'lodash';
const util = require('node:util');

export const BazaarApi = {
  installApp: async (
    tempConduit: Conduit,
    ship: string,
    desk: string
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      let subscriptionId: number = -1,
        timeout: NodeJS.Timeout;
      await tempConduit.watch({
        app: 'docket',
        path: '/charges',
        onSubscribed: (subscription: number) => {
          subscriptionId = subscription;
          // upon subscribing, start a timer. if we don't get the 'add-charge'
          //  event (see below) within the allotted time, it "usually" means the configured
          //  INSTALL_MOON is offline or down
          timeout = setTimeout(async () => {
            await tempConduit.unsubscribe(subscriptionId);
            console.log(
              `timeout installing ${ship}/${desk}. has ${desk} been published? also check the glob-ames value in the ${desk}'s docket file to ensure match with '${ship}'.`
            );
            reject(`timeout installing ${ship}/${desk}`);
          }, 60000);

          tempConduit.poke(docketInstall(ship, desk)).catch((e) => {
            console.log(e);
            if (timeout) clearTimeout(timeout);
            reject('install app error');
          });
        },
        onEvent: async (data: any, _id?: number, mark?: string) => {
          if (data.hasOwnProperty('add-charge')) {
            const charge = data['add-charge'].charge;
            // according to Tlon source, this determines when the app is fully installed
            if ('glob' in charge.chad || 'site' in charge.chad) {
              if (timeout) {
                clearTimeout(timeout);
              }
              await tempConduit.unsubscribe(subscriptionId);
              resolve(data);
            } else if ('hung' in charge.chad) {
              const err = charge.chad?.err || 'fail';
              console.log(
                `install failed => ${err}. have you uploaded the glob on the host?`
              );
              reject(err);
            } else if ('install' in charge.chad) {
              console.log(`'${ship}/${desk}' installation started...`);
            }
          }
        },
        onError: () => {
          console.log('subscription [docket/charges] rejected');
          reject('error on channel');
        },
        onQuit: () => {
          console.log('kicked from subscription [docket/charges]');
          reject('unexpected channel quit');
        },
      });
    });
  },
  addAlly: async (tempConduit: Conduit, ship: string) => {
    return new Promise(async (resolve, reject) => {
      const isAlly = await BazaarApi.isAlly(tempConduit, ship);
      if (isAlly) {
        console.log(`'${ship}' is already an ally. skipping...`);
        resolve(`'${ship}' is already an ally. skipping...`);
        return;
      }
      let subscriptionId: number = -1;
      let timeout: NodeJS.Timeout;
      await tempConduit.watch({
        app: 'treaty',
        path: '/treaties',
        onSubscribed: (subscription: number) => {
          subscriptionId = subscription;
          // upon subscribing, start a timer. if we don't get the 'add'
          //  event (see below) within the allotted time, it "usually" means the configured
          //  INSTALL_MOON does not have any apps available to install
          timeout = setTimeout(async () => {
            await tempConduit.unsubscribe(subscriptionId);
            console.log(
              `timeout forming alliance with ${ship}. are there apps published on '${ship}'?`
            );
            reject(`timeout forming alliance with ${ship}`);
          }, 60000);

          tempConduit.poke(allyShip(ship)).catch((e) => {
            console.log(e);
            if (timeout) clearTimeout(timeout);
            reject('add ally error');
          });
        },
        onEvent: async (data: any, _id?: number, mark?: string) => {
          if (data.hasOwnProperty('add')) {
            if (timeout) {
              clearTimeout(timeout);
            }
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
    });
  },
  getDocket: async (
    tempConduit: Conduit,
    desk: string
  ): Promise<any | undefined> => {
    const response = await tempConduit.scry({
      app: 'docket',
      path: '/charges', // the spaces scry is at the root of the path
    });
    // console.log(response.initial);
    return (
      (response.initial.hasOwnProperty(desk) && response.initial[desk]) ||
      undefined
    );
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
      // console.log('hasTreaty: testing treaty => %o', {
      //   ship,
      //   desk,
      //   response,
      // });
      return response !== undefined;
    } catch (e) {
      console.log(e);
    }
    return;
  },
  installDesk: async (
    tempConduit: Conduit,
    ship: string,
    desk: string
  ): Promise<string> => {
    return new Promise(async (resolve) => {
      console.log(`checking if '/${ship}/${desk}' installed...`);
      const docket = await BazaarApi.getDocket(tempConduit, desk);
      if (docket !== undefined) {
        if ('glob' in docket.chad && docket.chad.glob === null) {
          // app fully installed. return
          console.log(`'/${ship}/${desk}' already installed. skipping...`);
          resolve('success');
          return;
        } else if ('install' in docket.chad) {
          // app install in progress
          console.log(
            `unexpected state. it appears '/${ship}/${desk}' is currently installing. report error.`
          );
          resolve('unexpected installation status. app currently installing');
          return;
        } else if ('hung' in docket.chad) {
          // prior installation attempt failed
          console.log(
            `unexpected state. it appears an earlier attempt at installing '/${ship}/${desk}' failed.`
          );
          resolve(
            'installation already attempted. please uninstall the failed installation and try again.'
          );
          return;
        }
        // prior installation attempt failed
        console.log(
          `unexpected state. ${desk} already exists in docket. bailing...`
        );
        resolve(
          `unexpected installation status. ${desk} currently exists in docket. skipping...`
        );
        return;
      }
      if (!(await BazaarApi.isAlly(tempConduit, ship))) {
        console.log('forming alliance with %o...', ship);
        BazaarApi.addAlly(tempConduit, ship)
          .then(() => {
            console.log('installing %o...', desk);
            BazaarApi.installApp(tempConduit, ship, desk)
              .then((result) => {
                console.log('app install complete => %o', result);
                resolve('success');
              })
              .catch((e) => resolve(e));
          })
          .catch((e) => {
            console.error(`addAlly error => '${e}'`);
            resolve(e);
          });
      } else {
        console.log(`${ship} is an ally. checking for '${desk}' treaty...`);
        const hasTreaty = await BazaarApi.hasTreaty(tempConduit, ship, desk);
        if (hasTreaty) {
          console.log(`treaty found. installing '/${ship}/${desk}'...`);
          BazaarApi.installApp(tempConduit, ship, desk)
            .then((result: any) => {
              console.log('app install complete => %o', result);
              resolve('success');
            })
            .catch((e) => resolve(e));
        } else {
          console.log(`treaty not found. has ${desk} been published?`);
          resolve(
            `treaty '${ship}/${desk}' not found. Was the treaty published?`
          );
        }
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
  uninstallApp: async (conduit: Conduit, desk: string) =>
    await conduit.poke(docketUninstall(desk)),
  // in the case of space apps, all we have is the desk, since docket/glob
  //   data does not include host/source ship. therefore we request an install
  //   back to the space host which requires desk name only. space host will then
  //   resolve origin ship by scrying its own treaties
  resolveAppInstall: async (conduit: Conduit, app: any) => {
    console.log(util.inspect(app, { depth: 10 }));
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
      BazaarApi.installDesk(conduit, ship, app.id)
        .then((response) => resolve('success'))
        .catch((e) => reject(e));
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
    // const allies = await conduit.scry({
    //   app: 'treaty',
    //   path: '/allies', // the spaces scry is at the root of the path
    // });
    // state.initialAllies(allies.ini);
    conduit.watch({
      app: 'treaty',
      path: `/allies`,
      onSubscribed: (eventId: number) => {
        console.log(`message [${eventId}]: subscribed to treaty/allies...`);
      },
      onEvent: async (data: any, _id?: number, mark?: string) => {
        // console.log('/treaty/allies => %o', { allies: data });
        handleBazaarReactions({ allies: data }, state);
      },
      onError: () => console.log('subscription [treaty/allies] rejected'),
      onQuit: () => console.log('kicked from subscription [treaty/allies]'),
    });
    conduit.watch({
      app: 'treaty',
      path: `/treaties`,
      onSubscribed: (eventId: number) => {
        console.log(`message [${eventId}]: subscribed to treaty/treaties...`);
      },
      onEvent: async (data: any, _id?: number, mark?: string) => {
        // console.log('/treaty/treaties => %o', { treaties: data });
        handleBazaarReactions({ treaties: data }, state);
      },
      onError: () => console.log('subscription [treaty/treaties] rejected'),
      onQuit: () => console.log('kicked from subscription [treaty/treaties]'),
    });
    conduit.watch({
      app: 'bazaar',
      path: `/updates`,
      onSubscribed: (eventId: number) => {
        console.log(`message [${eventId}]: subscribed to /bazaar/updates...`);
      },
      onEvent: async (data: any, _id?: number, mark?: string) => {
        // console.log(data);
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
      // console.log('initial =>');
      // console.log(util.inspect(data, { depth: 10, colors: true }));
      // console.log('<= initial');
      state.initial(data['initial']);
      break;
    case 'allies':
      // console.log('allies =>');
      // console.log(util.inspect(data, { depth: 10, colors: true }));
      // console.log('<= allies');
      state.initialAllies(data['allies'].ini);
      break;
    case 'treaties':
      // console.log('treaties =>');
      // console.log(util.inspect(data, { depth: 10, colors: true }));
      // console.log('<= treaties');
      state.initialTreaties(data['treaties'].ini);
      break;
    // event when a new space is joined and our ship has successfully
    //   subscribed to the space
    case 'space-apps':
      // console.log('space-apps =>');
      // console.log(util.inspect(data, { depth: 10, colors: true }));
      // console.log('<= space-apps');
      const entry = data['space-apps'];
      state.initialSpace(entry['space-path'], entry);
      break;
    case 'ally-added':
      break;
    case 'ally-removed':
      break;
    case 'treaty-added':
      {
        console.log('treaty-added =>');
        console.log(util.inspect(data, { depth: 10, colors: true }));
        console.log('<= treaty-added');
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
        console.log('app-installed =>');
        console.log(util.inspect(data, { depth: 10, colors: true }));
        console.log('<= app-installed');
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
        console.log('app-uninstalled =>');
        console.log(util.inspect(data, { depth: 10, colors: true }));
        console.log('<= app-uninstalled');
        let detail = data['app-uninstalled'];
        // @ts-ignore
        state.setUninstalled(detail['app-id']);
      }
      break;
    case 'pin':
      {
        console.log('pin =>');
        console.log(util.inspect(data, { depth: 10, colors: true }));
        console.log('<= pin');
        // console.log('pin reaction => %o', data);
        const detail = data['pin'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        // @ts-ignore
        state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.updatePinnedRank(app);
        state.getBazaar(space)?.setPinnedApps(app.sort);
        state.getBazaar(space)?.togglePinnedAppsChange();
      }
      break;
    case 'unpin':
      {
        console.log('unpin =>');
        console.log(util.inspect(data, { depth: 10, colors: true }));
        console.log('<= unpin');
        const detail = data['unpin'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        // @ts-ignore
        state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.updatePinnedRank(app);
        state.getBazaar(space)?.setPinnedApps(app.sort);
        state.getBazaar(space)?.togglePinnedAppsChange();
      }
      break;
    case 'set-pin-order':
      {
        console.log('set-pin-order =>');
        console.log(util.inspect(data, { depth: 10, colors: true }));
        console.log('<= set-pin-order');
        const detail = data['set-pin-order'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        // @ts-ignore
        // state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.setPinnedApps(app.sort);
        state.getBazaar(space)?.togglePinnedAppsChange();
      }
      break;
    case 'recommend':
      {
        console.log('recommend =>');
        console.log(util.inspect(data, { depth: 10, colors: true }));
        console.log('<= recommend');
        const detail = data['recommend'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        // @ts-ignore
        state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.updateRecommendedRank(app);
        state.getBazaar(space)?.setRecommendedApps(app.sort);
        state.getBazaar(space)?.toggleRecommendedAppsChange();
      }
      break;
    case 'unrecommend':
      {
        console.log('unrecommend =>');
        console.log(util.inspect(data, { depth: 10, colors: true }));
        console.log('<= unrecommend');
        const detail = data['unrecommend'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        // @ts-ignore
        state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.updateRecommendedRank(app);
        state.getBazaar(space)?.setRecommendedApps(app.sort);
        state.getBazaar(space)?.toggleRecommendedAppsChange();
      }
      break;
    case 'suite-add':
      {
        console.log('suite-add =>');
        console.log(util.inspect(data, { depth: 10, colors: true }));
        console.log('<= suite-add');
        const detail = data['suite-add'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        // @ts-ignore
        state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.updateSuiteRank(app);
        state.getBazaar(space)?.setSuiteApps(app.sort);
        state.getBazaar(space)?.toggleSuiteAppsChange();
      }
      break;
    case 'suite-remove':
      {
        console.log('suite-remove =>');
        console.log(util.inspect(data, { depth: 10, colors: true }));
        console.log('<= suite-remove');
        // console.log('suite-remove [reaction] => %o', data);
        const detail = data['suite-remove'];
        const space = Object.keys(detail)[0];
        const app = detail[space];
        state.getBazaar(space)?.setApp(app);
        state.getBazaar(space)?.updateSuiteRank(app);
        state.getBazaar(space)?.setSuiteApps(app.sort);
        state.getBazaar(space)?.toggleSuiteAppsChange();
      }
      break;
    case 'my-recommendations':
      {
        console.log(
          'my-recommendations => %o',
          util.inspect(data, { depth: 10, colors: true })
        );
        state.updateMyRecommendations(data['my-recommendations']);
      }
      break;
    default:
      // unknown
      break;
  }
};
