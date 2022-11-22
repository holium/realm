import { NewBazaarStoreType } from '../services/spaces/models/bazaar';
import { Conduit } from '@holium/conduit';
import { Patp } from '../types';

export interface PinPoke {
  path: { ship: Patp; space: string };
  'app-id': string;
  index: number | null;
}

export interface UnpinPoke {
  path: { ship: Patp; space: string };
  'app-id': string;
}
export interface AddToSuitePoke {
  path: { ship: Patp; space: string };
  'app-id': string;
  index: number;
}

export interface RemoveFromSuitePoke {
  path: { ship: Patp; space: string };
  index: number;
}
export interface InstallPoke {
  ship: Patp;
  desk: string;
}
export interface UninstallPoke {
  desk: string;
}

export const BazaarApi = {
  getApps: (conduit: Conduit, path: string, tag: string) => null,
  getAllies: (conduit: Conduit, path: string) => null,
  getTreaties: (conduit: Conduit, patp: string) => null,
  scryAllies: async (conduit: Conduit): Promise<any> => {
    const response = await conduit.scry({
      app: 'bazaar',
      path: `/allies`,
    });
    return response.allies;
  },
  scryTreaties: async (conduit: Conduit, ship: Patp): Promise<any> => {
    const response = await conduit.scry({
      app: 'bazaar',
      path: `/treaties/${ship}`,
    });
    return response.treaties;
  },
  installApp: async (conduit: Conduit, body: InstallPoke) => {
    conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        'install-app': body,
      },
    });
  },
  uninstallApp: async (conduit: Conduit, body: UninstallPoke) => {
    conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        'uninstall-app': body,
      },
    });
  },
  pinApp: async (conduit: Conduit, body: PinPoke) => {
    return await new Promise((resolve, reject) => {
      conduit.poke({
        app: 'bazaar',
        mark: 'bazaar-action',
        json: {
          pin: body,
        },
        reaction: 'bazaar-reaction.pinned',
        onReaction(data) {
          resolve(data.pinned);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  unpinApp: async (conduit: Conduit, body: UnpinPoke): Promise<any> => {
    return await new Promise((resolve, reject) => {
      conduit.poke({
        app: 'bazaar',
        mark: 'bazaar-action',
        json: {
          unpin: body,
        },
        reaction: 'bazaar-reaction.unpinned',
        onReaction(data) {
          resolve(data.unpinned);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  addToSuite: async (conduit: Conduit, body: AddToSuitePoke) => {
    return await new Promise((resolve, reject) => {
      conduit.poke({
        app: 'bazaar',
        mark: 'bazaar-action',
        json: {
          'suite-add': body,
        },
        reaction: 'bazaar-reaction.suite-added',
        onReaction(data) {
          resolve(data['suite-added']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  removeFromSuite: async (
    conduit: Conduit,
    body: RemoveFromSuitePoke
  ): Promise<any> => {
    return await new Promise((resolve, reject) => {
      conduit.poke({
        app: 'bazaar',
        mark: 'bazaar-action',
        json: {
          'suite-remove': body,
        },
        reaction: 'bazaar-reaction.suite-removed',
        onReaction(data) {
          resolve(data['suite-removed']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  recommendApp: async (conduit: Conduit, appId: string): Promise<any> => {
    // TODO insert instantly
    conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        recommend: { 'app-id': appId },
      },
      onError: (e: any) => {
        console.error(e);
      },
    });
  },
  unrecommendApp: async (conduit: Conduit, appId: string): Promise<any> => {
    conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        unrecommend: { 'app-id': appId },
      },
      onError: (e: any) => {
        console.error(e);
      },
    });
  },
  addAlly: async (conduit: Conduit, ship: Patp): Promise<any> => {
    return await new Promise(async (resolve, reject) => {
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
            console.log(
              `timeout forming alliance with ${ship}. is the ship running? are there apps published on '${ship}'?`
            );
            // force removal of the ship, so that future attempts to install an app will restart
            //  ally operation from scratch
            conduit
              .poke({
                app: 'treaty',
                mark: 'ally-update-0',
                json: {
                  del: ship,
                },
                onError: (e: any) => {
                  console.error(e);
                  reject(e);
                },
              })
              .catch((e) => {
                console.log(e);
                reject('del ally error');
              });
            reject(`timeout forming alliance with ${ship}`);
          }, 60000);

          conduit
            .poke({
              app: 'treaty',
              mark: 'ally-update-0',
              json: {
                add: ship,
              },
              onError: (e: any) => {
                console.error(e);
                reject(e);
              },
            })
            .catch((e) => {
              console.log(e);
              if (timeout) clearTimeout(timeout);
              reject('add ally error');
            });
        },
        onEvent: async (data: any, _id?: number, mark?: string) => {
          console.log(data);
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
};

export const BazaarSubscriptions = {
  updates: (conduit: Conduit, model: NewBazaarStoreType): void => {
    conduit.watch({
      app: 'bazaar',
      path: `/updates`,
      onEvent: async (data: any, _id?: number, mark?: string) => {
        if (mark === 'bazaar-reaction') {
          handleReactions(data, model);
        }
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription %spaces'),
    });
  },
};
const handleReactions = (data: any, model: NewBazaarStoreType) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    case 'initial':
      model._initial(data.initial);
      break;
    case 'app-install-update':
      //  installed, uninstalled, started, etc.
      const { appId, app } = data['app-install-update'];
      model._setAppStatus(appId, app);
      break;
    case 'pinned':
      model._addPinned(data.pinned);
      break;
    case 'unpinned':
      model._removePinned(data.unpinned);
      break;
    case 'suite-added':
      model._suiteAdded(data['suite-added']);
      break;
    case 'suite-removed':
      model._suiteRemoved(data['suite-removed']);
      break;
    case 'recommended':
      model._addRecommended(data.recommended);
      break;
    case 'unrecommended':
      model._removeRecommended(data.unrecommended);
      break;
    case 'stall-update':
      model._updateStall(data['stall-update']);
      break;
    case 'joined-bazaar':
      // console.log('joined-bazaar', data['joined-bazaar']);
      model._addJoined(data['joined-bazaar']);
      break;
    default:
      break;
  }
};
