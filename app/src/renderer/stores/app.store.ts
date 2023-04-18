import { Instance, types, clone } from 'mobx-state-tree';
import { createContext, useContext } from 'react';
import { AccountModelType } from './models/Account.model';
import { defaultTheme } from '../lib/defaultTheme';
import { Theme, ThemeType } from './models/theme.model';
import { AuthenticationModel } from './auth.store';
import { ShellModel } from './models/Shell.model';
import { RealmUpdateTypes } from 'os/realm.types';
import { watchOnlineStatus } from 'renderer/lib/offline';
import { BazaarIPC, MainIPC, NotifIPC, RealmIPC, SpacesIPC } from './ipc';
import { shipStore } from './ship.store';
import { SoundActions } from 'renderer/lib/sound';

const Screen = types.enumeration(['login', 'onboarding', 'os']);

const AppStateModel = types
  .model('AppStateModel', {
    booted: types.boolean,
    currentScreen: Screen,
    theme: Theme,
    isLoggedIn: types.boolean,
    authStore: AuthenticationModel,
    shellStore: ShellModel,
    online: types.boolean,
    connectionStatus: types.enumeration([
      'connecting',
      'initialized',
      'connected',
      'offline',
      'failed',
      'stale',
      'refreshing',
      'refreshed',
    ]),
    //
  })
  .actions((self) => ({
    setBooted(data: {
      accounts: AccountModelType[];
      screen: 'login' | 'onboarding' | 'os';
      session?: {
        patp: string;
        cookie: string;
      };
    }) {
      self.authStore._setAccounts(data.accounts);
      self.currentScreen = data.screen;
      self.booted = true;
      if (data.session) {
        self.authStore._setSession(data.session.patp);
        self.shellStore.setIsBlurred(false);
        self.isLoggedIn = true;
      }
    },
    setTheme(theme: ThemeType) {
      self.theme = clone(theme);
      if (self.authStore.session) {
        // if the user is logged in, update the theme for the account
        // the login screen will use the theme from the account
        self.authStore.setAccountCurrentTheme(theme);
      }
    },
    setLoggedIn() {
      self.isLoggedIn = true;
      self.shellStore.setIsBlurred(false);
    },
    setLoggedOut() {
      self.isLoggedIn = false;
      self.shellStore.setIsBlurred(true);
    },
    reset() {
      self.booted = false;
      self.isLoggedIn = false;
      self.shellStore.setIsBlurred(true);
    },
    setConnectionStatus(status: any) {
      self.connectionStatus = status;
      localStorage.setItem('connection-status', status);
    },
    setOnline(isOnline: boolean) {
      self.online = isOnline;
    },
  }));

// const loadSnapshot = () => {
//   const localStore = localStorage.getItem('trayStore');
//   if (localStore) return JSON.parse(localStore);
//   return {};
// };

// const persistedState = loadSnapshot();

export const appState = AppStateModel.create({
  booted: false,
  currentScreen: 'onboarding',
  theme: Theme.create(defaultTheme),
  isLoggedIn: false,
  authStore: {
    accounts: [],
    session: null,
    status: 'initial',
  },
  shellStore: {},
  online: navigator.onLine,
  connectionStatus:
    (localStorage.getItem('connection-status') as any) || 'offline',
});

watchOnlineStatus(appState);
// OSActions.onConnectionStatus((_event: any, status: any) => {
//   coreStore.setConnectionStatus(status);
// });

// onSnapshot(appState, (snapshot) => {
//   localStorage.setItem('appState', JSON.stringify(snapshot));
// });

export type AppStateType = Instance<typeof AppStateModel>;
export const AppStateContext = createContext<null | AppStateType>(appState);

export const AppStateProvider = AppStateContext.Provider;
export function useAppState() {
  const store = useContext(AppStateContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}

RealmIPC.boot();

MainIPC.onInitialDimensions((_e: any, dims: any) => {
  appState.shellStore.setDesktopDimensions(dims.width, dims.height);
});

window.addEventListener('beforeunload', function (event) {
  if (event.type === 'beforeunload') {
    console.log('refreshing');
    appState.shellStore.closeDialog();
    // The event was triggered by a refresh or navigation
    // Your code to handle the refresh event here
  } else {
    console.log('closing');
    appState.shellStore.closeDialog();
    // The event was triggered by a window/tab close
    // Your code to handle the close event here
  }
});
// updates
RealmIPC.onUpdate((_event: any, update: RealmUpdateTypes) => {
  if (update.type === 'booted') {
    appState.reset();
    shipStore.reset();
    appState.setBooted(update.payload);
    if (update.payload.session) {
      shipStore.setShip(update.payload.session);
    }
  }
  if (update.type === 'authenticated') {
    SoundActions.playLogin();
    appState.authStore._setSession(update.payload.patp);
    appState.setLoggedIn();
    shipStore.setShip(update.payload);
  }
  if (update.type === 'logout') {
    appState.setLoggedOut();
    shipStore.reset();
    SoundActions.playLogout();
  }
});

NotifIPC.onUpdate(({ type, payload }: any) => {
  switch (type) {
    case 'notification-added':
      shipStore.notifStore.onNotifAdded(payload);
      if (
        shipStore.chatStore.isChatSelected(payload.path) &&
        payload.app === 'realm-chat'
      ) {
        shipStore.notifStore.readPath(payload.app, payload.path);
      }
      break;
    case 'notification-updated':
      shipStore.notifStore.onNotifUpdated(payload);
      break;
    case 'notification-deleted':
      shipStore.notifStore.onNotifDeleted(payload);
      break;
  }
});

SpacesIPC.onUpdate((_event: any, update: any) => {
  const { type, payload } = update;
  // on update we need to requery the store
  switch (type) {
    case 'initial':
      shipStore.spacesStore.init();
      break;
    case 'invitations':
      shipStore.spacesStore._onInitialInvitationsUpdate(payload);
      break;
    case 'invite-sent':
      shipStore.spacesStore._onSpaceMemberAdded(payload);
      break;
    case 'invite-updated':
      shipStore.spacesStore._onSpaceMemberUpdated(payload);
      break;
    case 'kicked':
      shipStore.spacesStore._onSpaceMemberKicked(payload);
      break;
    case 'edited':
      shipStore.spacesStore._onSpaceMemberUpdated(payload);
      break;
    case 'add':
      shipStore.spacesStore._onSpaceAdded(payload);
      break;
    case 'replace':
      shipStore.spacesStore._onSpaceUpdated(payload);
      break;
    case 'remove':
      shipStore.spacesStore._onSpaceRemoved(payload);
      break;
  }
});

BazaarIPC.onUpdate((_event: any, update: any) => {
  const { type, payload } = update;
  // on update we need to requery the store
  switch (type) {
    case 'initial':
      shipStore.bazaarStore._onInitialLoad(payload);
      break;
    case 'installation-update':
      shipStore.bazaarStore._onInstallationUpdate(payload);
      break;
    case 'recommended':
      shipStore.bazaarStore._onRecommendedUpdate(payload.appId);
      break;
    case 'unrecommended':
      shipStore.bazaarStore._onUnrecommendedUpdate(payload.appId);
      break;
    case 'pinned-update':
      shipStore.bazaarStore._onPinnedUpdate(payload.app.id, payload.index);
      break;
    case 'pins-reordered':
      shipStore.bazaarStore._onUnrecommendedUpdate(payload.appId);
      break;
    case 'dock-update':
      shipStore.spacesStore._onDockUpdate(payload);
      break;
    case 'stall-update':
      shipStore.spacesStore._onStallUpdate(payload);
      break;
  }
});