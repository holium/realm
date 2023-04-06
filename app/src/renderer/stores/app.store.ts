import { RealmIPC } from './ipc';
import { defaultTheme } from '@holium/shared';
import { createContext, useContext } from 'react';
import { Instance, types, clone } from 'mobx-state-tree';
import { AccountModelType } from './models/account.model';
import { Theme, ThemeType } from './models/theme.model';
import { AuthenticationModel } from './auth.store';
import { ShellModel } from './models/shell.model';
import { RealmActions } from 'renderer/logic/actions/main';
import { RealmUpdateTypes } from 'os/realm.types';

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

RealmIPC.boot();

RealmIPC.onUpdate((_event: any, update: RealmUpdateTypes) => {
  if (update.type === 'booted') {
    appState.reset();
    appState.setBooted(update.payload);
  }
  if (update.type === 'authenticated') {
    appState.authStore._setSession(update.payload.patp);
    appState.setLoggedIn();
  }
  if (update.type === 'logout') {
    appState.setLoggedOut();
  }
});

RealmActions.onInitialDimensions((_e: any, dims: any) => {
  appState.shellStore.setDesktopDimensions(dims.width, dims.height);
});

window.addEventListener('beforeunload', function (event) {
  if (event.type === 'beforeunload') {
    console.log('refreshing');
    appState.shellStore.closeDialog();
    // appState.reset();
    // The event was triggered by a refresh or navigation
    // Your code to handle the refresh event here
  } else {
    console.log('closing');
    appState.shellStore.closeDialog();
    // The event was triggered by a window/tab close
    // Your code to handle the close event here
  }
});
