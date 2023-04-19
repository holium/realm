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

export interface ReorderPinnedAppsPoke {
  path: { ship: Patp; space: string };
  dock: string[];
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
  getApps: (_conduit: Conduit, _path: string, _tag: string) => null,
  getAllies: (_conduit: Conduit, _path: string) => null,
  getTreaties: (_conduit: Conduit, _patp: string) => null,
  scryHash: (
    conduit: Conduit,
    app: string
  ): Promise<{ 'app-hash': string }> => {
    return conduit.scry({
      app: 'bazaar',
      path: `/app-hash/${app}`,
    });
  },
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
  suspendApp: async (conduit: Conduit, desk: string) => {
    conduit.poke({
      app: 'hood',
      mark: 'kiln-suspend',
      json: desk,
    });
  },
  resumeApp: async (conduit: Conduit, desk: string) => {
    conduit.poke({
      app: 'hood',
      mark: 'kiln-revive',
      json: desk,
    });
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
        onReaction(data: any) {
          resolve(data.pinned);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  reorderPinnedApps: async (conduit: Conduit, body: ReorderPinnedAppsPoke) => {
    return await new Promise((resolve, reject) => {
      conduit.poke({
        app: 'bazaar',
        mark: 'bazaar-action',
        json: {
          'reorder-pins': body,
        },
        reaction: 'bazaar-reaction.pins-reodered',
        onReaction(data: any) {
          resolve(data['pins-reodered']);
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
        onReaction(data: any) {
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
        onReaction(data: any) {
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
        onReaction(data: any) {
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
    conduit
      .poke({
        app: 'treaty',
        mark: 'ally-update-0',
        json: {
          add: ship,
        },
        onError: (e: any) => {
          console.error(e);
          // reject(e);
        },
      })
      .catch((e: any) => {
        console.log(e);
        // if (timeout) clearTimeout(timeout);
        // reject('add ally error');
      });
    // return await new Promise(async (resolve, reject) => {
    //   let subscriptionId: number = -1;
    //   let timeout: NodeJS.Timeout;
    //   await conduit.watch({
    //     app: 'bazaar',
    //     path: '/updates',
    //     onSubscribed: (subscription: number) => {
    //       subscriptionId = subscription;
    //       // upon subscribing, start a timer. if we don't get the 'add'
    //       //  event (see below) within the allotted time, it "usually" means the configured
    //       //  INSTALL_MOON does not have any apps available to install
    //       timeout = setTimeout(async () => {
    //         console.log(
    //           `timeout forming alliance with ${ship}. is the ship running? are there apps published on '${ship}'?`
    //         );
    //         conduit
    //           .poke({
    //             app: 'treaty',
    //             mark: 'ally-update-0',
    //             json: {
    //               del: ship,
    //             },
    //             onError: (e: any) => {
    //               console.error(e);
    //               reject(e);
    //             },
    //           })
    //           .catch((e) => {
    //             console.log(e);
    //             if (timeout) clearTimeout(timeout);
    //             reject('add ally error');
    //           });
    //         await conduit.unsubscribe(subscriptionId);
    //         reject('timeout');
    //       }, 60000);

    //       conduit
    //         .poke({
    //           app: 'treaty',
    //           mark: 'ally-update-0',
    //           json: {
    //             add: ship,
    //           },
    //           onError: (e: any) => {
    //             console.error(e);
    //             reject(e);
    //           },
    //         })
    //         .catch((e) => {
    //           console.log(e);
    //           if (timeout) clearTimeout(timeout);
    //           reject('add ally error');
    //         });
    //     },
    //     onEvent: async (data: any, _id?: number, mark?: string) => {
    //       console.log(data);
    //       if (data.hasOwnProperty('treaties-loaded')) {
    //         if (timeout) {
    //           clearTimeout(timeout);
    //         }
    //         await conduit.unsubscribe(subscriptionId);
    //         resolve(data);
    //       }
    //     },
    //     onError: () => {
    //       console.log('subscription [treaty/treaties] rejected');
    //       reject('subscription [treaty/treaties] rejected');
    //     },
    //     onQuit: () => {
    //       console.log('kicked from subscription [treaty/treaties]');
    //       reject('kicked from subscription [treaty/treaties]');
    //     },
    //   });
    // });
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
      onSubscribed: () => {
        model.setSubscriptionStatus('subscribed');
      },
      onError: () => {
        console.error('Subscription to %bazaar rejected');
        model.setSubscriptionStatus('unsubscribed');
      },
      onQuit: () => {
        console.error('Kicked from %bazaar subscription');
        model.setSubscriptionStatus('unsubscribed');
      },
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
      // eslint-disable-next-line no-case-declarations
      const installUpdate = data['app-install-update'];
      model._setAppStatus(
        installUpdate.appId,
        installUpdate.app,
        installUpdate.grid
      );
      break;
    case 'pinned':
      model._addPinned(data.pinned);
      break;
    case 'unpinned':
      model._removePinned(data.unpinned);
      break;
    case 'pins-reodered':
      if (data['pins-reodered']) model._reorderPins(data['pins-reodered']);
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
      model._addJoined(data['joined-bazaar']);
      break;
    case 'treaties-loaded':
      model._treatiesLoaded();
      break;
    case 'new-ally':
      const ally = data['new-ally'];
      model._allyAdded(ally.ship, ally.desks);
      break;
    case 'ally-deleted':
      // console.log(data);
      model._allyDeleted(data['ally-deleted'].ship);
      break;
    case 'rebuild-catalog':
      // console.log('rebuild-catalog => %o', data['rebuild-catalog']);
      model._rebuildCatalog(data['rebuild-catalog']);
      // model._allyDeleted(data['ally-deleted'].ship);
      break;
    case 'rebuild-stall':
      // model._allyDeleted(data['ally-deleted'].ship);
      model._rebuildStall(data['rebuild-stall']);
      break;
    case 'clear-stall':
      model._clearStall(data['clear-stall']);
      // model._allyDeleted(data['ally-deleted'].ship);
      break;
    default:
      break;
  }
};