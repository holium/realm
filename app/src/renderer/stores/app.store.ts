import { RealmIPC, ShipIPC } from '../logic/ipc';
import { createContext, useContext } from 'react';
import {
  applyPatch,
  Instance,
  types,
  onSnapshot,
  applySnapshot,
  clone,
} from 'mobx-state-tree';

import { OSActions } from '../logic/actions/os';
import { AuthIPC } from 'renderer/logic/ipc';
import { AccountModel, AccountModelType } from './models/Account.model';
import { Theme, ThemeType } from './models/Theme.model';
import { defaultTheme } from '@holium/shared';
import { AuthenticationModel } from './auth.store';
import {
  AuthUpdateInit,
  AuthUpdateLogin,
  AuthUpdateTypes,
} from 'os/services-new/auth/auth.service';
import { ShellModel } from './models/Shell.model';
import { RealmActions } from 'renderer/logic/actions/main';
import { RealmUpdateBooted, RealmUpdateTypes } from 'os/index-new';

const Screen = types.enumeration(['login', 'onboarding', 'os']);

const AppStateModel = types
  .model('AppStateModel', {
    booted: types.boolean,
    currentScreen: Screen,
    theme: Theme,
    isLoggedIn: types.boolean,
    authStore: AuthenticationModel,
    shellStore: ShellModel,
    //
  })
  .actions((self) => ({
    setBooted(data: {
      accounts: AccountModelType[];
      screen: 'login' | 'onboarding' | 'os';
    }) {
      self.authStore._setAccounts(data.accounts);
      self.booted = true;
      self.currentScreen = data.screen;
    },
    setTheme(theme: ThemeType) {
      self.theme = clone(theme);
    },
    setLoggedIn() {
      self.isLoggedIn = true;
    },
    setLoggedOut() {
      self.isLoggedIn = false;
    },
    reset() {
      self.booted = false;
      self.isLoggedIn = false;
    },
  }));

// const loadSnapshot = () => {
//   const localStore = localStorage.getItem('trayStore');
//   if (localStore) return JSON.parse(localStore);
//   return {};
// };

// const persistedState = loadSnapshot();
// delete defaultTheme.id
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
});

// onSnapshot(appState, (snapshot) => {
//   localStorage.setItem('appState', JSON.stringify(snapshot));
// });

type AppStateType = Instance<typeof AppStateModel>;
export const AppStateContext = createContext<null | AppStateType>(appState);

export const AppStateProvider = AppStateContext.Provider;
export function useAppState() {
  const store = useContext(AppStateContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}

OSActions.onLogin((_event: any) => {
  appState.setLoggedIn();
});

OSActions.onLogout((_event: any) => {
  appState.setLoggedOut();
});

ShipIPC.onUpdate((_event: any, update: any) => {
  console.log('ship update', update);
});

RealmIPC.boot();

RealmIPC.onUpdate((_event: any, update: RealmUpdateTypes) => {
  if (update.type === 'booted') {
    appState.setBooted(update.payload);
  }
  if (update.type === 'authenticated') {
    appState.setLoggedIn();
    appState.authStore._setSession(update.payload.patp);
  }
});

AuthIPC.onUpdate((_evt: any, update: AuthUpdateTypes) => {
  console.log('auth update', update);
  switch (update.type) {
    case 'init':
      appState.authStore._setAccounts((update as AuthUpdateInit).payload);
      break;
    case 'login':
      appState.authStore._setSession((update as AuthUpdateLogin).payload.patp);
      break;
    // case 'logout':
    //   authState.session = null;
    //   break;

    default:
      break;
  }
});

RealmActions.onInitialDimensions((_e: any, dims: any) => {
  appState.shellStore.setDesktopDimensions(dims.width, dims.height);
});

window.addEventListener('beforeunload', function (event) {
  if (event.type === 'beforeunload') {
    console.log('refreshing');
    // The event was triggered by a refresh or navigation
    // Your code to handle the refresh event here
  } else {
    console.log('closing');
    // The event was triggered by a window/tab close
    // Your code to handle the close event here
  }
});
