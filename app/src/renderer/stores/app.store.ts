import { createContext, useContext } from 'react';
import { clone, flow, Instance, types } from 'mobx-state-tree';

import {
  defaultTheme,
  OnboardingStorage,
  RealmOnboardingStep,
  Theme,
  ThemeType,
} from '@holium/shared';

import { RealmUpdateBooted } from 'os/realm.types';
import { LexiconUpdateType } from 'os/services/ship/lexicon.types';
import { ConduitState } from 'os/services/api';
import { watchOnlineStatus } from 'renderer/lib/offline';
import { SoundActions } from 'renderer/lib/sound';
import { MobXAccount } from 'renderer/stores/models/account.model';

import { AuthenticationModel } from './auth.store';
import {
  AuthIPC,
  BazaarIPC,
  LexiconIPC,
  MainIPC,
  NotifIPC,
  OnboardingIPC,
  RealmIPC,
  SpacesIPC,
} from './ipc';
import { ShellModel } from './models/shell.model';
import { shipStore } from './ship.store';

const Screen = types.enumeration(['login', 'onboarding', 'os']);

const AppStateModel = types
  .model('AppStateModel', {
    booted: types.boolean,
    showTitleBar: types.boolean,
    seenSplash: types.boolean,
    currentScreen: Screen,
    onboardingStep: types.string,
    theme: Theme,
    authStore: AuthenticationModel,
    shellStore: ShellModel,
    online: types.boolean,
    connectionStatus: types.enumeration([
      'initialized',
      'connecting',
      'connected',
      'disconnected',
      'failed',
      'stale',
      'refreshing',
      'refreshed',
      'offline',
      'no-internet',
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
    setShowTitleBar(show: boolean) {
      self.showTitleBar = show;
    },
    setLoggedOut(serverId?: string) {
      self.authStore._clearSession(serverId);
      self.shellStore.setIsBlurred(true);
    },
    reset() {
      self.booted = false;
      self.shellStore.setIsBlurred(true);
    },
    setConnectionStatus(status: ConduitState) {
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
    setCurrentScreen(screen: Instance<typeof Screen>) {
      self.currentScreen = screen;
    },
    setOnboardingStep(step: RealmOnboardingStep) {
      self.onboardingStep = step;
    },
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
  showTitleBar: false,
  currentScreen: 'login',
  onboardingStep: '/login',
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
MainIPC.onConnectionStatus(appState.setConnectionStatus);

window.electron.app.onSetTitlebarVisible((show: boolean) => {
  appState.setShowTitleBar(show);
});

window.electron.app.onSetFullScreen((isFullScreen: boolean) => {
  appState.shellStore.setFullscreen(isFullScreen);
});

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

  MainIPC.onDimensionsChange((_: any, dims: any) => {
    appState.shellStore.setDesktopDimensions(dims.width, dims.height);
  });

  MainIPC.onSetFullScreen((isFullScreen) => {
    appState.shellStore.setFullscreen(isFullScreen);
  });

  LexiconIPC.onUpdate(async (update: LexiconUpdateType) => {
    //update lexicon store with the latest update
    shipStore.lexiconStore.setUpdate(update?.payload);
  });
  RealmIPC.onUpdate(async (update) => {
    if (update.type === 'booted') {
      appState.reset();
      shipStore.reset();
      appState.setBooted(update.payload);
      if (update.payload.session) {
        window.ship = update.payload.session.serverId;
        appState.setLoggedIn(update.payload.session.serverId);
        shipStore.init(update.payload.session);

        appState.setCurrentScreen('os');
      }

      if (update.payload.accounts?.length) {
        const masterAccount = await OnboardingIPC.getMasterAccount(
          update.payload.accounts[0].accountId
        );

        if (!masterAccount) {
          appState.setCurrentScreen('onboarding');
        }
      } else {
        appState.setCurrentScreen('onboarding');
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

      appState.setCurrentScreen('os');
    }
    if (update.type === 'auth-failed') {
      // SoundActions.playError();
      appState.authStore.status.setError(update.payload);
    }
    if (update.type === 'logout') {
      appState.setLoggedOut(update.payload.serverId);
      shipStore.reset();
      SoundActions.playLogout();

      appState.setCurrentScreen('login');
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
    if (update.type === 'add-identity') {
      appState.setOnboardingStep('/hosting');
      appState.setCurrentScreen('onboarding');
    }
    if (update.type === 'onboarding-finished') {
      appState.setOnboardingStep('/login');
      appState.setCurrentScreen('login');

      OnboardingStorage.reset();
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
      case 'init':
        shipStore.notifStore._onInit(payload);
        break;
      case 'notification-added':
        shipStore.notifStore._onNotifAdded(payload);
        if (
          shipStore.chatStore.isChatSelected(payload.path) &&
          payload.app === 'realm-chat'
        ) {
          shipStore.notifStore.readPath(payload.app, payload.path);
        }
        break;
      case 'notification-updated':
        shipStore.notifStore._onNotifUpdated(payload);
        break;
      case 'notification-deleted':
        shipStore.notifStore._onNotifDeleted(payload);
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
      case 'bookmark-added':
        shipStore.spacesStore._onBookmarkAdded(payload);
        break;
      case 'bookmark-removed':
        shipStore.spacesStore._onBookmarkRemoved(payload);
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
      case 'joined-bazaar':
        shipStore.spacesStore._onJoinedBazaar(payload);
        break;
      case 'new-ally':
        if (payload.desks?.length === 0) {
          // if there are no published apps, we will never get the
          //  'treaties-loaded' event (see below); therefore scry just in
          //  case and set the loading state to loaded
          shipStore.bazaarStore.treatyLoader.set('loaded');
        }
        shipStore.bazaarStore.alliesLoader.set('loaded');
        shipStore.bazaarStore._addAlly(payload.ship, payload);
        break;
      case 'ally-deleted':
        shipStore.bazaarStore._removeAlly(payload.ship);
        break;
      case 'treaties-loaded':
        shipStore.bazaarStore.scryTreaties(payload.ship);
        break;
      case 'reorder-grid-index':
        shipStore.bazaarStore._onReorderGridIndex(payload);
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
