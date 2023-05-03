import { createContext, useContext } from 'react';
import { flow, Instance, onSnapshot, SnapshotIn, types } from 'mobx-state-tree';

import { RealmSessionCredentials } from 'os/realm.types';

import { ChatStore } from './chat.store';
import { ShipIPC } from './ipc';
import { BazaarStore, BazaarStoreType } from './models/bazaar.model';
import { LoaderModel } from './models/common.model';
import { CredentialsModel } from './models/credentials.model';
import { FeaturedStore } from './models/featured.model';
import { FriendsStore } from './models/friends.model';
import { NotifStore } from './models/notification.model';
import { SpacesStore } from './models/spaces.model';
import {
  NetworkStoreType,
  ProtocolType,
  SharingMode,
  WalletCreationMode,
  WalletStore,
  WalletView,
} from './models/wallet.model';
import { RoomsStore } from './rooms.store';

export const ShipStore = types
  .model('ShipStore', {
    credentials: CredentialsModel,
    friends: FriendsStore,
    notifStore: NotifStore,
    chatStore: ChatStore,
    spacesStore: SpacesStore,
    bazaarStore: BazaarStore,
    walletStore: WalletStore,
    featuredStore: FeaturedStore,
    roomsStore: RoomsStore,
    loader: LoaderModel,
  })
  .actions((self) => ({
    init(session: RealmSessionCredentials) {
      if (!localStorage.getItem(`${session.serverId}-firstLoad`)) {
        self.chatStore.loader.set('first-load');
      }
      self.credentials = CredentialsModel.create(session);
      self.friends.init();
      self.chatStore.loadChatList();
      self.chatStore.init();
      self.bazaarStore.init();
      self.spacesStore.init();
      self.chatStore.fetchInboxMetadata();
      self.walletStore.init();
      self.roomsStore.init();
    },
    reset() {
      self.notifStore.reset();
      self.chatStore.reset();
      self.bazaarStore.reset();
      self.spacesStore.reset();
      self.friends.reset();
      self.featuredStore.reset();
    },
    getOurGroups: flow(function* () {
      try {
        return yield ShipIPC.getOurGroups() as Promise<any>;
      } catch (e) {
        console.error(e);
      }
    }),
    getGroup: flow(function* (path: string) {
      try {
        return yield ShipIPC.getGroup(path) as Promise<any>;
      } catch (e) {
        console.error(e);
      }
    }),
    getGroupMembers: flow(function* (path: string) {
      try {
        return yield ShipIPC.getGroupMembers(path) as Promise<any>;
      } catch (e) {
        console.error(e);
      }
    }),
  }));

// TODO better snapshot loading

const loadBazaarSnapshot = (): SnapshotIn<BazaarStoreType> => {
  const recentDevsSnapshot = localStorage.getItem('recentAppDevs');
  const recentAppsSnapshot = localStorage.getItem('recentApps');
  let recentDevs: string[] = [];
  let recentApps: string[] = [];
  if (recentDevsSnapshot) recentDevs = JSON.parse(recentDevsSnapshot);
  if (recentAppsSnapshot) recentApps = JSON.parse(recentAppsSnapshot);

  return {
    recentDevs: recentDevs || [],
    recentApps: recentApps || [],
    catalog: {},
  };
};

export const shipStore = ShipStore.create({
  credentials: {},
  notifStore: {
    notifications: [],
  },
  friends: {
    all: [],
  },
  chatStore: {
    subroute: 'inbox',
    isOpen: false,
    pinnedChats: [],
    loader: { state: 'loading' },
  },
  spacesStore: {
    spaces: {},
    loader: {
      state: 'loading',
    },
  },
  bazaarStore: loadBazaarSnapshot(),
  walletStore: {
    navState: {
      view: WalletView.NEW,
      protocol: ProtocolType.ETH_GORLI,
      lastEthProtocol: ProtocolType.ETH_GORLI,
      btcNetwork: NetworkStoreType.BTC_MAIN,
      // transSend: false,
    },
    ethereum: {
      // block: 0,
      gorliBlock: 0,
      protocol: ProtocolType.ETH_GORLI,
      settings: {
        walletCreationMode: WalletCreationMode.DEFAULT,
        sharingMode: SharingMode.ANYBODY,
        defaultIndex: 0,
      },
      initialized: false,
      conversions: {},
    },
    bitcoin: {
      block: 0,
      settings: {
        walletCreationMode: WalletCreationMode.DEFAULT,
        sharingMode: SharingMode.ANYBODY,
        defaultIndex: 0,
      },
      conversions: {},
    },
    btctest: {
      block: 0,
      settings: {
        walletCreationMode: WalletCreationMode.DEFAULT,
        sharingMode: SharingMode.ANYBODY,
        defaultIndex: 0,
      },
      conversions: {},
    },
    navHistory: [],
    creationMode: 'default',
    sharingMode: 'anybody',
    lastInteraction: Date.now(),
    initialized: false,
    settings: {
      passcodeHash: '',
    },
    forceActive: false,
  },
  featuredStore: {
    spaces: {},
  },
  loader: {
    state: 'initial',
  },
  roomsStore: {
    provider: window.ship,
    rooms: {},
  },
});

onSnapshot(shipStore, (snapshot) => {
  localStorage.setItem(
    'recentApps',
    JSON.stringify(snapshot.bazaarStore.recentApps)
  );
  localStorage.setItem(
    'recentAppDevs',
    JSON.stringify(snapshot.bazaarStore.recentDevs)
  );
});
// -------------------------------
// Create core context
// -------------------------------
export type ShipStoreInstance = Instance<typeof ShipStore>;
export const ShipStoreContext = createContext<null | ShipStoreInstance>(
  shipStore
);

export const AccountProvider = ShipStoreContext.Provider;
export function useShipStore() {
  const store = useContext(ShipStoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
