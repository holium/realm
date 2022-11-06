import { createContext, useContext } from 'react';
import { Instance, types, onSnapshot } from 'mobx-state-tree';
import { Patp } from 'os/types';
import { calculatePopoverAnchorById } from 'renderer/logic/lib/position';

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

const loadingState = types.enumeration(['loading-published-apps', '']);

export type LoadingState = Instance<typeof loadingState>;

const PopoverCoords = types.model({
  left: types.number,
  top: types.number,
});

export const AppInstallStore = types
  .model('AppInstallStore', {
    searchMode: searchMode,
    searchModeArgs: types.array(types.string),
    searchString: types.string,
    searchPlaceholder: types.string,
    selectedShip: types.string,
    selectedDesk: types.string,
    loadingState: loadingState,
    coords: PopoverCoords,
  })
  .actions((self) => ({
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
    setSelectedShip(ship: Patp) {
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
      self.coords = calculatePopoverAnchorById(popoverId, {
        dimensions,
        anchorOffset: {
          x: 40,
          y: 20,
        },
      });
    },
  }));

const loadSnapshot = () => {
  const localStore = localStorage.getItem('appSearchStore');
  if (localStore) return JSON.parse(localStore);
  return {};
};

const persistedState = loadSnapshot();

export const appInstallStore = AppInstallStore.create({
  searchMode: 'none',
  searchString: '',
  searchPlaceholder: 'Search...',
  selectedShip: '',
  selectedDesk: '',
  loadingState: '',
  coords: (persistedState && persistedState.coords) || {
    left: 0,
    top: 0,
  },
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
