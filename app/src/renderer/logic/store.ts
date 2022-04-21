import { createContext, useContext } from 'react';
import { Instance, onSnapshot, types } from 'mobx-state-tree';
import { ShipStore } from './stores/ship';
import { ConfigStore } from './stores/config';
// import { toJS } from 'mobx';

const OSStore = types.model('OSStore', {
  shipStore: ShipStore,
  configStore: ConfigStore,
  contextStore: types.map(
    types.model({
      path: types.string,
      name: types.string,
    })
  ),
});

function loadStoreSnapshot(storeName: string) {
  const rootState = localStorage.getItem('osState');
  if (rootState) {
    const storeData = JSON.parse(rootState)[storeName];
    console.log(storeData);
    return storeData;
  }
  return null;
}

const initialState = OSStore.create({
  configStore: loadStoreSnapshot('configStore') || {
    firstTime: false,
    theme: 'light',
  },
  shipStore: loadStoreSnapshot('shipStore') || {},
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
