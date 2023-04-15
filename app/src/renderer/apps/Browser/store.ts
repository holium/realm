import { createContext, useContext } from 'react';
import { toJS } from 'mobx';
import { Instance, onSnapshot, types } from 'mobx-state-tree';
import { LoaderModel } from 'os/services/common.model';
import { AppType } from 'os/services/spaces/models/bazaar';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { RealmActions } from 'renderer/logic/actions/main';
import { servicesStore } from 'renderer/logic/store';

import { nativeApps } from '../nativeApps';

import { isUrlSafe } from './helpers/createUrl';

const TabModel = types.model('BrowserTabModel', {
  id: types.identifier,
  url: types.string,
  isSafe: types.optional(types.boolean, true),
  loader: types.optional(LoaderModel, { state: 'initial' }),
});

export const BrowserModel = types
  .model('BrowserModel', {
    currentTab: types.optional(TabModel, {
      id: 'tab-0',
      url: 'https://duckduckgo.com',
      isSafe: true,
      loader: { state: 'initial' },
    }),
    tabs: types.array(TabModel),
  })
  .actions((self) => ({
    setUrl(url: string) {
      self.currentTab.url = url;
      self.currentTab.isSafe = isUrlSafe(url);
      self.currentTab.loader.state = 'initial';
    },
    setLoading() {
      self.currentTab.loader.state = 'loading';
    },
    setLoaded() {
      self.currentTab.loader.state = 'loaded';
    },
    setError() {
      self.currentTab.loader.state = 'error';
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

RealmActions.onBrowserOpen((_event: any, url: string) => {
  const relic = servicesStore.bazaar.getApp('os-browser');
  DesktopActions.openAppWindow(
    toJS(relic) || (nativeApps['os-browser'] as AppType)
  ).then(() => {
    browserState.setUrl(url);
  });
});
