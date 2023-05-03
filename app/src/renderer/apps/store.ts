import { createContext, useContext } from 'react';
import { Instance, onSnapshot, types } from 'mobx-state-tree';

import { Dimensions } from '@holium/design-system';

import { RealmIPC } from 'renderer/stores/ipc';
import {
  NetworkStoreType,
  NetworkType,
  SharingMode,
  WalletCreationMode,
  WalletStore,
  WalletView,
} from 'renderer/stores/models/wallet.model';

import { calculateAnchorPointById } from '../lib/position';
import { RoomsAppState } from './Rooms/rooms.model';

const TrayAppCoords = types.model({
  left: types.number,
  bottom: types.number,
});

const TrayAppDimensions = types.model({
  width: types.number,
  height: types.number,
});

export type TrayAppKeys =
  | 'rooms-tray'
  | 'account-tray'
  | 'messages-tray'
  | 'wallet-tray'
  | 'spaces-tray';

const TrayAppStore = types
  .model('TrayAppStore', {
    activeApp: types.maybeNull(
      types.enumeration([
        'rooms-tray',
        'account-tray',
        'messages-tray',
        'wallet-tray',
        'spaces-tray',
      ])
    ),
    coords: TrayAppCoords,
    dimensions: TrayAppDimensions,
    roomsApp: RoomsAppState,
    walletApp: WalletStore,
    innerNavigation: types.string,
  })
  .actions((self) => ({
    setTrayAppCoords(coords: Instance<typeof TrayAppCoords>) {
      self.coords = coords;
    },
    setTrayAppDimensions(dimensions: Instance<typeof TrayAppDimensions>) {
      self.dimensions = dimensions;
    },
    setTrayAppHeight(height: number) {
      self.dimensions.height = height;
    },
    getTrayAppHeight() {
      return self.dimensions.height;
    },
    closeActiveApp() {
      self.activeApp = null;
      self.innerNavigation = '';
    },
    clearInnerNavigation() {
      self.innerNavigation = '';
    },
    setActiveApp(
      appId: TrayAppKeys | null,
      params?: {
        willOpen: boolean;
        position: string;
        anchorOffset: any;
        dimensions: Dimensions;
        innerNavigation?: string;
      }
    ) {
      self.activeApp = appId;
      if (params?.willOpen && appId) {
        const { position, anchorOffset, dimensions } = params;
        self.coords = calculateAnchorPointById(
          appId,
          anchorOffset,
          position,
          dimensions
        );
        self.dimensions = dimensions;
      }
      if (params?.innerNavigation) {
        self.innerNavigation = params.innerNavigation;
      } else {
        self.innerNavigation = '';
      }
    },
  }));

const loadSnapshot = () => {
  const localStore = localStorage.getItem('trayStore');
  if (localStore) return JSON.parse(localStore);
  return {};
};

const persistedState = loadSnapshot();

export const walletAppDefault = {
  navState: {
    view: WalletView.NEW,
    protocol: NetworkType.ETH_GORLI,
    lastEthProtocol: NetworkType.ETH_GORLI,
    btcNetwork: NetworkStoreType.BTC_MAIN,
    transSend: false,
  },
  ethereum: {
    block: 0,
    gorliBlock: 0,
    protocol: NetworkType.ETH_GORLI,
    settings: {
      walletCreationMode: WalletCreationMode.DEFAULT,
      sharingMode: SharingMode.ANYBODY,
      defaultIndex: 0,
    },
    initialized: false,
    conversions: {},
  },
  bitcoin: {
    block: 0,
    settings: {
      walletCreationMode: WalletCreationMode.DEFAULT,
      sharingMode: SharingMode.ANYBODY,
      defaultIndex: 0,
    },
    conversions: {},
  },
  btctest: {
    block: 0,
    settings: {
      walletCreationMode: WalletCreationMode.DEFAULT,
      sharingMode: SharingMode.ANYBODY,
      defaultIndex: 0,
    },
    conversions: {},
  },
  navHistory: [],
  creationMode: 'default',
  sharingMode: 'anybody',
  lastInteraction: Date.now(),
  initialized: false,
  settings: {
    passcodeHash: '',
  },
  forceActive: false,
};

export const trayStore = TrayAppStore.create({
  activeApp: null,
  coords: (persistedState && persistedState.coords) || {
    left: 0,
    bottom: 0,
  },
  dimensions: (persistedState && persistedState.dimensions) || {
    width: 200,
    height: 200,
  },
  roomsApp: {
    currentView: 'list',
  },
  walletApp: walletAppDefault,
  innerNavigation: '',
});

onSnapshot(trayStore, (snapshot) => {
  localStorage.setItem('trayStore', JSON.stringify(snapshot));
});

// -------------------------------
// Create core context
// -------------------------------
type TrayInstance = Instance<typeof TrayAppStore>;
export const TrayStateContext = createContext<null | TrayInstance>(trayStore);

export const TrayProvider = TrayStateContext.Provider;
export function useTrayApps() {
  const store = useContext(TrayStateContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}

// TODO

RealmIPC.onUpdate((update) => {
  if (update.type === 'logout') {
    // applySnapshot(trayStore.walletApp, walletAppDefault);
  }
});

// Listen for all patches
// OSActions.onEffect((_event: any, value: any) => {
//   if (value.response === 'initial') {
//     if (value.resource === 'wallet') {
//       applySnapshot(trayStore.walletApp, value.model);
//     }
//   }
//   if (value.response === 'patch') {
//     if (value.resource === 'wallet') {
//       applyPatch(trayStore.walletApp, value.patch);
//     }
//   }
// });

// After boot, set the initial data
// OSActions.onBoot((_event: any, response: any) => {
//   if (response.wallet) {
//     applySnapshot(trayStore.walletApp, response.wallet);
//   }
// });
