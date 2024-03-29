import { createContext, useContext } from 'react';
import { flow, Instance, onSnapshot, SnapshotIn, types } from 'mobx-state-tree';

import { RealmSessionCredentials } from 'os/realm.types';
import { walletAppDefault } from 'renderer/apps/store';

import { ChatStore } from './chat.store';
import { ShipIPC } from './ipc';
import { LexiconStore } from './lexicon.store';
import { BazaarStore, BazaarStoreType } from './models/bazaar.model';
import { LoaderModel } from './models/common.model';
import { CredentialsModel } from './models/credentials.model';
import { FeaturedStore } from './models/featured.model';
import { FriendsStore } from './models/friends.model';
import { NotifStore } from './models/notification.model';
import { SettingsModel } from './models/settings.model';
import { SpacesStore } from './models/spaces.model';
import { WalletStore } from './models/wallet.model';
import { NotesStore, notesStore } from './notes/notes.store';
import { TroveStore } from './trove.store';

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
    notesStore: NotesStore,
    lexiconStore: LexiconStore,
    troveStore: TroveStore,
    // roomsStore: RoomsStore,
    settingsStore: SettingsModel,
    loader: LoaderModel,
  })
  .actions((self) => ({
    init(session: RealmSessionCredentials) {
      if (!localStorage.getItem(`${session.serverId}-firstLoad`)) {
        self.chatStore.inboxInitLoader.set('first-load');
      }
      self.credentials = CredentialsModel.create(session);
      self.friends.init();
      self.chatStore.fetchInboxMetadata();
      self.chatStore.loadChatList();
      self.bazaarStore.init();
      self.spacesStore.init();
      self.walletStore.init();
      // self.roomsStore.init();
      self.settingsStore.init(session.serverId);
    },
    reset() {
      self.notifStore.reset();
      self.chatStore.reset();
      self.bazaarStore.reset();
      self.spacesStore.reset();
      self.walletStore.reset();
      self.walletStore.reset();
      self.friends.reset();
      self.featuredStore.reset();
      // self.roomsStore.reset();
      self.settingsStore.reset();
    },
    getOurGroups: flow(function* () {
      try {
        return yield ShipIPC.getOurGroups() as Promise<any>;
      } catch (e) {
        console.error(e);
        return [];
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
    inboxLoader: { state: 'initial' },
    inboxInitLoader: { state: 'loading' },
    inboxMetadataLoader: { state: 'loading' },
    chatLoader: { state: 'initial' },
  },
  spacesStore: {
    spaces: {},
    loader: {
      state: 'loading',
    },
  },
  bazaarStore: loadBazaarSnapshot(),
  walletStore: walletAppDefault,
  notesStore,
  lexiconStore: { update: null },
  troveStore: { update: null },
  featuredStore: {
    spaces: {},
  },
  settingsStore: {
    identity: '',
    isolationModeEnabled: false,
    realmCursorEnabled: true,
    profileColorForCursorEnabled: true,
    standaloneChatPersonalWallpaperEnabled: false,
    standaloneChatSpaceWallpaperEnabled: true,
    systemSoundsEnabled: true,
  },
  loader: {
    state: 'initial',
  },
  // roomsStore: {
  //   provider: window.ship,
  //   rooms: {},
  // },
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
