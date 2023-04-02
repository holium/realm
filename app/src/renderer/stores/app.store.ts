import { ThemeModel } from './../../os/services/theme.model';
import { RealmIPC } from '../logic/ipc';
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

const Screen = types.enumeration(['login', 'onboarding', 'os']);

const AppStateModel = types
  .model('AppStateModel', {
    booted: types.boolean,
    currentScreen: Screen,
    accounts: types.array(AccountModel),
    theme: Theme,
    isLoggedIn: types.boolean,
    //
  })
  .actions((self) => ({
    setBooted(data: RealmEventData) {
      self.booted = true;
      applySnapshot(self.accounts, data.accounts);
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

AuthIPC.onUpdate((state: any) => {
  console.log('auth state updated', state);
});

OSActions.onLogin((_event: any) => {
  appState.setLoggedIn();
});

OSActions.onLogout((_event: any) => {
  appState.setLoggedOut();
});

type RealmEvents =
  | 'booted'
  | 'resume'
  | 'authenticated'
  | 'logout'
  | 'shutdown';

// type RealmUpdateType = {
//   event: 'booted';
//   data: {
//     screen: 'login' | 'onboarding' | 'os';
//   };
// };

type RealmEventData = {
  screen: 'login' | 'onboarding' | 'os';
  accounts: AccountModelType[];
};

RealmIPC.boot();

RealmIPC.onUpdate(
  (_event: any, data: { type: RealmEvents; payload: RealmEventData }) => {
    console.log('realm booted', data);
    if (data.type === 'booted') {
      appState.setBooted(data.payload);
    }
  }
);
