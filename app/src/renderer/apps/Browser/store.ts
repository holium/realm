import { createContext, useContext } from 'react';
import { Instance, onSnapshot, types } from 'mobx-state-tree';

import { MainIPC } from 'renderer/stores/ipc';
import { LoaderModel } from 'renderer/stores/models/common.model';

import { isUrlSafe, stripSlash } from './helpers/createUrl';

const TabModel = types.model('BrowserTabModel', {
  id: types.identifier,
  url: types.string,
  inPageNav: types.string,
  isSafe: types.optional(types.boolean, true),
  loader: types.optional(LoaderModel, { state: 'initial' }),
});

export const BrowserModel = types
  .model('BrowserModel', {
    currentTab: types.optional(TabModel, {
      id: 'tab-0',
      url: 'https://duckduckgo.com',
      inPageNav: 'https://duckduckgo.com',
      isSafe: true,
      loader: { state: 'initial' },
    }),
    tabs: types.array(TabModel),
  })
  .actions((self) => ({
    setUrl(url: string) {
      const cleanUrl = stripSlash(url);

      self.currentTab.url = cleanUrl;
      self.currentTab.inPageNav = cleanUrl;
      self.currentTab.isSafe = isUrlSafe(cleanUrl);
      self.currentTab.loader.state = 'initial';
    },
    setInPageNav(url: string) {
      // In page nav is set when the user clicks on a link within the webview.
      // We save the latest URL here as to not cause a re-render of the webview.
      const cleanUrl = stripSlash(url);

      self.currentTab.inPageNav = cleanUrl;
      self.currentTab.isSafe = isUrlSafe(cleanUrl);
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

MainIPC.onBrowserOpen((_event: any, _url: string) => {
  // const relic = servicesStore.bazaar.getApp('os-browser');
  // DesktopActions.openAppWindow(
  //   toJS(relic) || (nativeApps['os-browser'] as AppType)
  // ).then(() => {
  //   browserState.setUrl(url);
  // });
});
