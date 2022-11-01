import { Conduit } from '@holium/conduit';
import { cleanNounColor } from '../lib/color';
import { allyShip, docketInstall } from '@urbit/api';

export const DocketApi = {
  getApps: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'docket',
      path: '/charges',
    });
    const appMap = response.initial;
    Object.keys(appMap).forEach((appKey: string) => {
      const appColor = appMap[appKey].color;
      appMap[appKey].color = appColor && cleanNounColor(appColor);
    });
    return appMap;
  },
  requestTreaty: async (
    ship: string,
    desk: string,
    stateTree: any,
    conduit: Conduit,
    metadataStore: any
  ): Promise<number> => {
    const { apps } = stateTree;

    const key = `${ship}/${desk}`;
    if (key in apps) {
      return apps[key];
    }
    return new Promise((resolve, reject) => {
      conduit.watch({
        app: 'treaty',
        path: `/treaty/${key}`,
        onEvent: (data: any) => {
          resolve(data);
          metadataStore[key] = data;
        },
        onError: () => {
          reject('Subscription rejected');
        },
        onQuit: () => console.log('Kicked from subscription'),
      });
    });
  },
  isAlly: async (conduit: Conduit, ship: string) => {
    const response = await conduit.scry({
      app: 'treaty',
      path: '/allies', // the spaces scry is at the root of the path
    });
    return Object.keys(response.ini).includes(ship);
  },
  getDocket: async (
    conduit: Conduit,
    desk: string
  ): Promise<any | undefined> => {
    const response = await conduit.scry({
      app: 'docket',
      path: '/charges',
    });
    return (
      (response.initial.hasOwnProperty(desk) && response.initial[desk]) ||
      undefined
    );
  },
  hasTreaty: async (conduit: Conduit, ship: string, desk: string) => {
    try {
      const response = await conduit.scry({
        app: 'treaty',
        path: `/treaty/${ship}/${desk}`, // the spaces scry is at the root of the path
      });
      return response !== undefined;
    } catch (e) {
      console.log(e);
    }
    return;
  },
  addAlly: async (conduit: Conduit, ship: string) => {
    return new Promise(async (resolve, reject) => {
      const isAlly = await DocketApi.isAlly(conduit, ship);
      if (isAlly) {
        console.log(`'${ship}' is already an ally. skipping...`);
        resolve(`'${ship}' is already an ally. skipping...`);
        return;
      }
      let subscriptionId: number = -1;
      let timeout: NodeJS.Timeout;
      await conduit.watch({
        app: 'treaty',
        path: '/treaties',
        onSubscribed: (subscription: number) => {
          subscriptionId = subscription;
          // upon subscribing, start a timer. if we don't get the 'add'
          //  event (see below) within the allotted time, it "usually" means the configured
          //  INSTALL_MOON does not have any apps available to install
          timeout = setTimeout(async () => {
            await conduit.unsubscribe(subscriptionId);
            console.log(
              `timeout forming alliance with ${ship}. is the ship running? are there apps published on '${ship}'?`
            );
            reject(`timeout forming alliance with ${ship}`);
          }, 60000);

          conduit.poke(allyShip(ship)).catch((e) => {
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
            await conduit.unsubscribe(subscriptionId);
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
  installDesk: async (
    conduit: Conduit,
    ship: string,
    desk: string
  ): Promise<string> => {
    return new Promise(async (resolve) => {
      console.log(`checking if '/${ship}/${desk}' installed...`);
      const docket = await DocketApi.getDocket(conduit, desk);
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
      if (!(await DocketApi.isAlly(conduit, ship))) {
        console.log('forming alliance with %o...', ship);
        DocketApi.addAlly(conduit, ship)
          .then(() => {
            console.log('installing %o...', desk);
            DocketApi.installApp(conduit, ship, desk)
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
        const hasTreaty = await DocketApi.hasTreaty(conduit, ship, desk);
        if (hasTreaty) {
          console.log(`treaty found. installing '/${ship}/${desk}'...`);
          DocketApi.installApp(conduit, ship, desk)
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
  installApp: async (
    conduit: Conduit,
    ship: string,
    desk: string
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      let subscriptionId: number = -1,
        timeout: NodeJS.Timeout;
      await conduit.watch({
        app: 'docket',
        path: '/charges',
        onSubscribed: (subscription: number) => {
          subscriptionId = subscription;
          // upon subscribing, start a timer. if we don't get the 'add-charge'
          //  event (see below) within the allotted time, it "usually" means the configured
          //  INSTALL_MOON is offline or down
          timeout = setTimeout(async () => {
            await conduit.unsubscribe(subscriptionId);
            console.log(
              `timeout installing ${ship}/${desk}. has ${desk} been published? also check the glob-ames value in the ${desk}'s docket file to ensure match with '${ship}'.`
            );
            reject(`timeout installing ${ship}/${desk}`);
          }, 60000);
          conduit.poke(docketInstall(ship, desk)).catch((e) => {
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
              await conduit.unsubscribe(subscriptionId);
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
};
