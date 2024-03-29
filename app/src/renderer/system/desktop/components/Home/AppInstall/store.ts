import { createContext, useContext } from 'react';
import { cast, Instance, onSnapshot, types } from 'mobx-state-tree';

import { calculatePopoverAnchorById } from 'renderer/lib/position';
import { DocketApp, DocketAppType } from 'renderer/stores/models/bazaar.model';

const searchMode = types.enumeration([
  'none',
  'start',
  'ship-search',
  'app-search',
  'dev-app-search',
  'dev-app-detail',
  'app-summary',
]);

export type SearchMode = Instance<typeof searchMode>;

const loadingState = types.enumeration([
  'loading-published-apps',
  'published-apps-loaded',
  'adding-app-publisher',
  '',
]);

export type LoadingState = Instance<typeof loadingState>;

const PopoverCoords = types.model({
  left: types.number,
  top: types.number,
});

const Dimensions = types.model({
  width: types.number,
  height: types.number,
});

export const AppInstallStore = types
  .model('AppInstallStore', {
    popoverId: types.string,
    searchMode,
    searchModeArgs: types.array(types.string),
    searchString: types.string,
    searchPlaceholder: types.string,
    selectedShip: types.string,
    selectedDesk: types.string,
    loadingState,
    coords: PopoverCoords,
    dimensions: Dimensions,
    selectedApp: types.maybe(DocketApp),
  })
  .actions((self) => ({
    setApp(app: DocketAppType) {
      self.selectedApp = app;
    },
    setSearchMode(mode: SearchMode) {
      if (mode === self.searchMode) return;
      switch (mode) {
        case 'none':
          self.searchPlaceholder = 'Search...';
          self.selectedShip = '';
          self.searchString = '';
          break;
        case 'start':
          self.searchPlaceholder = 'Search...';
          self.selectedShip = '';
          self.searchString = '';
          break;
        case 'ship-search':
          break;
        case 'app-search':
          break;
        case 'dev-app-search':
          break;
        case 'dev-app-detail':
          break;
        case 'app-summary':
          // TODO make the dimensions dynamic
          // self.dimensions = { height: 450, width: 600 };
          // self.coords = calculatePopoverAnchorById(self.popoverId, {
          //   dimensions: self.dimensions,
          //   anchorOffset: {
          //     x: 40,
          //     y: 20,
          //   },
          // });
          break;
        default:
          break;
      }
      self.searchMode = mode;
    },
    setSearchModeArgs(args: any) {
      self.searchModeArgs = args;
    },
    setSearchString(search: any) {
      self.searchString = search;
    },
    setSearchPlaceholder(placeholder: any) {
      self.searchPlaceholder = placeholder;
    },
    setSelectedShip(ship: string) {
      self.selectedShip = ship;
    },
    setSelectedDesk(desk: string) {
      self.selectedDesk = desk;
    },
    setLoadingState(state: LoadingState) {
      self.loadingState = state;
    },
    open(popoverId: string, dimensions: any) {
      self.searchMode = 'start';
      self.popoverId = popoverId;
      self.dimensions = dimensions;
      self.coords = calculatePopoverAnchorById(popoverId, {
        anchorOffset: {
          x: 0,
          y: 4,
        },
        dimensions,
        centered: true,
      });
    },
    reset() {
      self.searchMode = 'none';
      self.searchModeArgs = cast([]);
      self.searchString = '';
      self.searchPlaceholder = 'Search...';
      self.selectedShip = '';
    },
  }));

const loadSnapshot = () => {
  const localStore = localStorage.getItem('appSearchStore');
  if (localStore) return JSON.parse(localStore);
  return {};
};

const persistedState = loadSnapshot();

export const appInstallStore = AppInstallStore.create({
  popoverId: '',
  searchMode: 'none',
  searchString: '',
  searchPlaceholder: 'Search...',
  selectedShip: '',
  selectedDesk: '',
  loadingState: '',
  coords: {
    left: persistedState?.coords?.left ?? 0,
    top: persistedState?.coords?.top ?? 0,
  },
  dimensions: { height: 450, width: 550 },
});

onSnapshot(appInstallStore, (snapshot) => {
  localStorage.setItem('appSearchStore', JSON.stringify(snapshot));
});

// -------------------------------
// Create core context
// -------------------------------
export type AppInstallInstance = Instance<typeof AppInstallStore>;
export const AppInstallContext = createContext<null | AppInstallInstance>(
  appInstallStore
);

export const AppInstallProvider = AppInstallContext.Provider;
export function useAppInstaller() {
  const store = useContext(AppInstallContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
