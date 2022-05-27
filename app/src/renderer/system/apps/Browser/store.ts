import { LoaderModel } from './../../../logic/stores/common/loader';
import { types, onSnapshot, Instance, tryReference } from 'mobx-state-tree';
import { toJS } from 'mobx';
import { createContext, useContext } from 'react';

const TabModel = types.model('BrowserTabModel', {
  id: types.identifier,
  favicon: types.string,
  title: types.string,
  url: types.string,
  loader: types.optional(LoaderModel, { state: 'initial' }),
});

export const BrowserModel = types
  .model('BrowserModel', {
    currentTab: types.optional(TabModel, {
      id: 'tab-0',
      url: 'https://qwant.com',
      title: 'New tab',
      favicon: '',
    }),
    tabs: types.array(TabModel),
  })
  .actions((self) => ({
    setCurrentTab(url: string) {
      // TODO update to https if possible
      const newTab = TabModel.create({
        id: `tab-${self.tabs.length + 1}`,
        url,
        title: 'New tab',
        favicon: '',
      });
      // if (!self.tabs.includes(newTab)) {
      //   self.tabs.push(newTab);
      // }
      self.currentTab = newTab;
    },
  }));

const cachedData = localStorage.getItem('nativeBrowserState');
const initialBrowserState = BrowserModel.create(
  cachedData ? JSON.parse(cachedData) : {}
);

export const browserState = initialBrowserState;
onSnapshot(browserState, (snapshot) => {
  localStorage.setItem('nativeBrowserState', JSON.stringify(snapshot));
});

// -------------------------------
// Create Browser context
// -------------------------------
export type BrowserInstance = Instance<typeof BrowserModel>;
const BrowserStateContext = createContext<null | BrowserInstance>(browserState);

export const BrowserProvider = BrowserStateContext.Provider;
export function useBrowser() {
  const store = useContext(BrowserStateContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
