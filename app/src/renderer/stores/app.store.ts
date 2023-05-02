import { createContext, useContext } from 'react';
import { clone, flow, Instance, types } from 'mobx-state-tree';

import { OnboardingStorage } from '@holium/shared';

import { RealmUpdateBooted } from 'os/realm.types';
import { watchOnlineStatus } from 'renderer/lib/offline';
import { SoundActions } from 'renderer/lib/sound';
import { MobXAccount } from 'renderer/stores/models/account.model';

import { defaultTheme } from '../lib/defaultTheme';
import { AuthenticationModel } from './auth.store';
import {
  AuthIPC,
  BazaarIPC,
  MainIPC,
  NotifIPC,
  OnboardingIPC,
  RealmIPC,
  SpacesIPC,
} from './ipc';
import { ShellModel } from './models/shell.model';
import { Theme, ThemeType } from './models/theme.model';
import { shipStore } from './ship.store';

const Screen = types.enumeration(['login', 'onboarding', 'os']);

const AppStateModel = types
  .model('AppStateModel', {
    booted: types.boolean,
    seenSplash: types.boolean,
    currentScreen: Screen,
    theme: Theme,
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
    error: types.maybeNull(types.string),
  })
  .actions((self) => ({
    setBooted(data: RealmUpdateBooted['payload']) {
      self.authStore.setAccounts(data.accounts);
      self.seenSplash = data.seenSplash;
      self.booted = true;
    },
    setTheme(theme: ThemeType) {
      self.theme = clone(theme);
      if (self.authStore.session) {
        // if the user is logged in, update the theme for the account
        // the login screen will use the theme from the account
        self.authStore.setAccountCurrentTheme(theme);
        localStorage.setItem('lastTheme', JSON.stringify(theme));
      }
    },
    setLoggedIn(serverId: string) {
      self.authStore._setSession(serverId);
      self.shellStore.setIsBlurred(false);
    },
    setLoggedOut(serverId?: string) {
      self.authStore._clearSession(serverId);
      self.shellStore.setIsBlurred(true);
    },
    reset() {
      self.booted = false;
      self.shellStore.setIsBlurred(true);
    },
    setConnectionStatus(status: any) {
      self.connectionStatus = status;
      localStorage.setItem('connection-status', status);
    },
    setOnline(isOnline: boolean) {
      self.online = isOnline;
    },
    setSeenSplash: flow(function* () {
      self.seenSplash = true;
      yield AuthIPC.setSeenSplash() as Promise<void>;
    }),
  }))
  .views((self) => ({
    get loggedInAccount(): MobXAccount | undefined {
      return self.authStore.accounts.find(
        (a) => a.serverId === self.authStore.session?.serverId
      );
    },
  }));

// const loadSnapshot = () => {
//   const localStore = localStorage.getItem('trayStore');
//   if (localStore) return JSON.parse(localStore);
//   return {};
// };

// const persistedState = loadSnapshot();

const lastTheme = localStorage.getItem('lastTheme');

export const appState = AppStateModel.create({
  booted: false,
  seenSplash: false,
  currentScreen: 'onboarding',
  theme: lastTheme
    ? Theme.create(JSON.parse(lastTheme))
    : Theme.create(defaultTheme),
  authStore: {
    accounts: [],
    session: null,
    status: { state: 'initial' },
  },
  shellStore: {
    nativeConfig: {},
  },
  online: navigator.onLine,
  connectionStatus:
    (localStorage.getItem('connection-status') as string | undefined) ||
    'offline',
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

let isOnUpdateRegistered = false;

function registerOnUpdateListener() {
  if (isOnUpdateRegistered) {
    console.log('onUpdate listener already registered.');
    return;
  }

  MainIPC.onInitialDimensions((_e: any, dims: any) => {
    appState.shellStore.setDesktopDimensions(dims.width, dims.height);
  });
  // updates
  RealmIPC.onUpdate((update) => {
    if (update.type === 'booted') {
      appState.reset();
      shipStore.reset();
      if (update.payload.session) window.ship = update.payload.session.serverId;
      appState.setBooted(update.payload);
      if (update.payload.session) {
        console.log('booted with session', update.payload.session);
        appState.setLoggedIn(update.payload.session.serverId);
        shipStore.init(update.payload.session);
      }
    }
    if (update.type === 'auth-success') {
      SoundActions.playLogin();
      window.ship = update.payload.serverId;
      OnboardingStorage.set({
        lastAccountLogin: update.payload.serverId,
      });
      appState.setLoggedIn(update.payload.serverId);
      shipStore.init(update.payload);
    }
    if (update.type === 'auth-failed') {
      // SoundActions.playError();
      appState.authStore.status.setError(update.payload);
    }
    if (update.type === 'logout') {
      appState.setLoggedOut(update.payload.serverId);
      shipStore.reset();
      SoundActions.playLogout();
    }
  });

  OnboardingIPC.onUpdate((update) => {
    if (update.type === 'account-added') {
      appState.authStore._onAddAccount(update.payload);
    }
    if (update.type === 'account-removed') {
      appState.authStore._onRemoveAccount(update.payload);
    }
    if (update.type === 'account-updated') {
      appState.authStore._onUpdateAccount(update.payload);
    }
    if (update.type === 'onboarding-ended') {
      appState.authStore._onOnboardingEnded(update.payload);
    }
  });

  AuthIPC.onUpdate((update) => {
    if (update.type === 'account-added') {
      appState.authStore._onAddAccount(update.payload);
    }
    if (update.type === 'account-removed') {
      appState.authStore._onRemoveAccount(update.payload);
    }
    if (update.type === 'account-updated') {
      appState.authStore._onUpdateAccount(update.payload);
    }
    // if (update.type === 'init') {
    //   appState.authStore.setAccounts(update.payload);
    // }
  });

  NotifIPC.onUpdate(({ type, payload }) => {
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

  SpacesIPC.onUpdate(({ type, payload }) => {
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

  BazaarIPC.onUpdate(({ type, payload }) => {
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
      case 'dock-update':
        shipStore.spacesStore._onDockUpdate(payload);
        break;
      case 'stall-update':
        shipStore.spacesStore._onStallUpdate(payload);
        break;
    }
  });

  window.addEventListener('beforeunload', function (event) {
    if (event.type === 'beforeunload') {
      console.log('refreshing');
      appState.shellStore.closeDialog();
      // BazaarIPC.reset();
      // SpacesIPC.reset();
      // NotifIPC.reset();
      // AuthIPC.removeHandlers && AuthIPC.removeHandlers();
      // RealmIPC.removeHandlers && RealmIPC.removeHandlers();
      // The event was triggered by a refresh or navigation
      // Your code to handle the refresh event here
    } else {
      console.log('closing');
      appState.shellStore.closeDialog();
      // The event was triggered by a window/tab close
      // Your code to handle the close event here
    }
  });

  isOnUpdateRegistered = true;
}

registerOnUpdateListener();
