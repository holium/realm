// @ts-nocheck
import { LoaderModel } from './stores/common/loader';
import { createContext, useContext } from 'react';
import {
  Instance,
  onSnapshot,
  types,
  castToSnapshot,
  applySnapshot,
} from 'mobx-state-tree';
import { ShipModel, ShipStore } from './ship/store';
import { ConfigStore, ConfigStoreType } from './stores/config';
import { AuthStore, AuthStoreType } from './auth/store';
import { SpaceStore, SpaceStoreType } from './space/store';
import { SignupStore } from './auth/store';
import { onStart } from './api/realm.core';
import { ThemeStore } from './theme/store';
import { DesktopStore } from './desktop/store';

// type OSStoreType = {
//   shipStore: ShipStoreType;
//   configStore: ConfigStoreType;
//   authStore: AuthStoreType;
//   spaceStore: SpaceStoreType;
// };

function loadStoreSnapshot(stateName: string, storeName: string) {
  const rootState = localStorage.getItem(stateName);
  if (rootState) {
    const storeData = JSON.parse(rootState)[storeName];
    return storeData;
  }
  return null;
}

const OSStore = types.model('OSStore', {
  configStore: ConfigStore,
  themeStore: ThemeStore,
  desktopStore: DesktopStore,
});

const AuthState = types.model('AuthState', {
  authStore: AuthStore,
  signupStore: SignupStore,
});

const initialAuthState = AuthState.create({
  authStore: loadStoreSnapshot('authState', 'authStore') || { firstTime: true },
  signupStore: loadStoreSnapshot('osState', 'signupStore') || {},
});

const initialOSState = OSStore.create({
  // authStore: loadStoreSnapshot('osState', 'authStore') || {},
  // signupStore: loadStoreSnapshot('osState', 'signupStore') || {},
  configStore: loadStoreSnapshot('osState', 'configStore') || {},
  themeStore: loadStoreSnapshot('osState', 'themeStore') || {
    wallpaper:
      'https://images.unsplash.com/photo-1554147090-e1221a04a025?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=4096&q=80',
  },
  desktopStore: loadStoreSnapshot('osState', 'desktopStore') || {},
  // shipStore: loadStoreSnapshot('osState', 'shipStore') || {},
  // spaceStore: loadStoreSnapshot('osState', 'spaceStore') || { pinned: [] },
});

const initialShipState = ShipStore.create({
  ship: loadStoreSnapshot('osState', 'shipStore') || undefined,
});

export const osState = initialOSState;
export const authState = initialAuthState;
export const shipState = initialShipState;

const initialSpacesState = SpaceStore.create({
  loader: { state: 'initial' },
  spaces: loadStoreSnapshot('spacesState', 'spaces') || {},
});
initialSpacesState.load(
  loadStoreSnapshot('spacesState', 'selected'),
  osState.themeStore
);

export const spacesState = initialSpacesState;

window.electron.core.onEffect((_event: any, value: any) => {
  // console.log(value);

  if (value.response === 'diff') {
    console.log('got effect data => ', value.json);
  }
  if (value.response === 'patch') {
    if (value.resource === 'ship') {
      shipState.ship?.syncPatches(value);
    }
    if (value.resource === 'auth') {
      authState.authStore.syncPatches(value);
    }
  }
  if (value.response === 'initial') {
    if (value.resource === 'ship') {
      shipState.initialSync(value);
    }
    if (value.resource === 'auth') {
      authState.authStore.initialSync(value);
    }
    if (value.resource === 'theme') {
      osState.themeStore.initialSync(value);
    }
  }
});

window.electron.core.onReady((_event: any, data: any) => {
  // TODO on ready status handling
  // osStore.spaceStore.getApps();
  // console.log('logged in a ready', data);
  // onStart();
});

window.electron.app.setFullscreen((_event: any, data: any) => {
  osState.desktopStore.setFullscreen(data);
});

window.electron.app.setAppviewPreload((_event: any, data: any) => {
  osState.desktopStore.setAppviewPreload(data);
});

onSnapshot(osState, (snapshot) => {
  localStorage.setItem('osState', JSON.stringify(snapshot));
});

onSnapshot(authState, (snapshot) => {
  localStorage.setItem('authState', JSON.stringify(snapshot));
});

onSnapshot(shipState, (snapshot) => {
  localStorage.setItem('shipState', JSON.stringify(snapshot));
});

onSnapshot(spacesState, (snapshot) => {
  localStorage.setItem('spacesState', JSON.stringify(snapshot));
});

// -------------------------------
// Create OS context
// -------------------------------
export type OSInstance = Instance<typeof OSStore>;
const OSStateContext = createContext<null | OSInstance>(osState);

export const OSProvider = OSStateContext.Provider;
export function useMst() {
  const store = useContext(OSStateContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
// -------------------------------
// Create auth context
// -------------------------------
export type AuthInstance = Instance<typeof AuthState>;
const AuthStateContext = createContext<null | AuthInstance>(authState);

export const AuthProvider = AuthStateContext.Provider;
export function useAuth() {
  const store = useContext(AuthStateContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}

// -------------------------------
// Create ship context
// -------------------------------
export type ShipInstance = Instance<typeof ShipStore>;
const ShipStateContext = createContext<null | ShipInstance>(shipState);

export const ShipProvider = ShipStateContext.Provider;
export function useShip() {
  const store = useContext(ShipStateContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}

// -------------------------------
// Create spaces context
// -------------------------------
export type SpaceInstance = Instance<typeof SpaceStore>;
const SpacesStateContext = createContext<null | SpaceInstance>(spacesState);

export const SpaceProvider = SpacesStateContext.Provider;
export function useSpaces() {
  const store = useContext(SpacesStateContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
