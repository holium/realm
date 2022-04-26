import { createContext, useContext } from 'react';
import { Instance, onSnapshot, types } from 'mobx-state-tree';
import { ShipStore } from './ship/store';
import { ConfigStore } from './stores/config';
import { AuthStore } from './auth/store';
import { SpaceStore } from './space/store';

const OSStore = types.model('OSStore', {
  shipStore: ShipStore,
  configStore: ConfigStore,
  authStore: AuthStore,
  spaceStore: SpaceStore,
});

window.electron.core.onEffect((_event: any, value: any) => {
  if (value.response === 'diff') {
    console.log('got effect data => ', value.json);
  }
});

window.electron.core.onReady((_event: any) => {
  osStore.spaceStore.getApps();
});

function loadStoreSnapshot(storeName: string) {
  const rootState = localStorage.getItem('osState');
  if (rootState) {
    const storeData = JSON.parse(rootState)[storeName];
    return storeData;
  }
  return null;
}

const initialState = OSStore.create({
  authStore: {
    currentStep: 'add-ship',
    newShip: {
      patp: '~labdex-dillyx-lomder-librun',
      url: 'https://test-moon-1.holium.network',
      loader: { state: 'initial' },
      status: { state: 'authenticated' },
    },
    loader: { state: 'initial' },
    installer: { state: 'initial' },
  },
  configStore: loadStoreSnapshot('configStore') || {
    firstTime: true,
    theme: 'light',
  },
  shipStore: loadStoreSnapshot('shipStore') || {},
  spaceStore: loadStoreSnapshot('spaceStore') || { pinned: [] },
});

export const osStore = initialState;

export const setFirstTime = () => {
  osStore.configStore.setFirstTime();
};

onSnapshot(osStore, (snapshot) => {
  // TODO snapshot it
  localStorage.setItem('osState', JSON.stringify(snapshot));
});

export type OSInstance = Instance<typeof OSStore>;
const OSStoreContext = createContext<null | OSInstance>(osStore);

export const { Provider } = OSStoreContext;
export function useMst() {
  const store = useContext(OSStoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
