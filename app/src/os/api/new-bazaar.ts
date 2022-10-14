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
    return new Promise((resolve, reject) => {
      conduit.poke({
        app: 'bazaar',
        mark: 'bazaar-action',
        json: {
          'install-app': body,
        },
        reaction: 'bazaar-reaction.app-install-done',
        onReaction(data) {
          resolve(data['app-install-done']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  uninstallApp: async (conduit: Conduit, body: UninstallPoke) => {
    return new Promise((resolve, reject) => {
      conduit.poke({
        app: 'bazaar',
        mark: 'bazaar-action',
        json: {
          'uninstall-app': body,
        },
        reaction: 'bazaar-reaction.app-uninstalled',
        onReaction(data) {
          resolve(data['app-uninstalled']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  pinApp: async (conduit: Conduit, body: PinPoke) => {
    return new Promise((resolve, reject) => {
      conduit.poke({
        app: 'bazaar',
        mark: 'bazaar-action',
        json: {
          pin: body,
        },
        reaction: 'bazaar-reaction.pinned',
        onReaction(data) {
          resolve(data['pinned']);
        },
        onError: (e: any) => {
          reject(e);
        },
      });
    });
  },
  unpinApp: async (conduit: Conduit, body: UnpinPoke): Promise<any> => {
    return new Promise((resolve, reject) => {
      conduit.poke({
        app: 'bazaar',
        mark: 'bazaar-action',
        json: {
          unpin: body,
        },
        reaction: 'bazaar-reaction.unpinned',
        onReaction(data) {
          resolve(data['unpinned']);
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
    conduit.poke({
      app: 'treaty',
      mark: 'ally-update-0',
      json: {
        add: ship,
      },
      onError: (e: any) => {
        console.error(e);
      },
    });
  },
};

export const BazaarSubscriptions = {
  updates: (conduit: Conduit, model: NewBazaarStoreType): void => {
    conduit.watch({
      app: 'bazaar',
      path: `/updates`,
      onEvent: async (data: any, _id?: number, mark?: string) => {
        console.log('bazaar watch -> ', mark, data);
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
      model._initial(data['initial']);
      break;
    case 'app-install-start':
      model._installStart(data['app-install-start']);
      break;
    case 'app-install-update':
      model._installingUpdate(data['app-install-update']);
      break;
    case 'app-install-done':
      model._installDone(data['app-install-done']);
      break;
    case 'app-uninstalled':
      model._uninstalled(data['app-uninstalled']);
      break;
    case 'pinned':
      model._addPinned(data['pinned']);
      break;
    case 'unpinned':
      model._removePinned(data['unpinned']);
      break;
    case 'recommended':
      model._addRecommended(data['recommended']);
      break;
    case 'unrecommended':
      model._removeRecommended(data['unrecommended']);
      break;
    default:
      break;
  }
};
