import { LoaderModel } from 'os/services/common.model';
import { types, onSnapshot, Instance } from 'mobx-state-tree';
import { createContext, useContext } from 'react';
import { RealmActions } from 'renderer/logic/actions/main';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { nativeApps } from '..';
import { isUrlSafe } from './helpers/createUrl';

const TabModel = types.model('BrowserTabModel', {
  id: types.identifier,
  favicon: types.string,
  title: types.string,
  url: types.string,
  isSafe: types.optional(types.boolean, true),
  loader: types.optional(LoaderModel, { state: 'initial' }),
});

export const BrowserModel = types
  .model('BrowserModel', {
    currentTab: types.optional(TabModel, {
      id: 'tab-0',
      url: 'https://neeva.com',
      isSafe: true,
      title: 'New tab',
      favicon: '',
      loader: { state: 'initial' },
    }),
    tabs: types.array(TabModel),
  })
  .actions((self) => ({
    navigate(url: string) {
      const newTab = TabModel.create({
        id: `tab-${self.tabs.length + 1}`,
        url,
        isSafe: isUrlSafe(url),
        title: 'New tab',
        favicon: '',
        loader: { state: 'initial' },
      });
      // if (!self.tabs.includes(newTab)) {
      //   self.tabs.push(newTab);
      // }
      self.currentTab = newTab;
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
  DesktopActions.openAppWindow('', nativeApps['os-browser']).then(() =>
    browserState.navigate(url)
  );
});
