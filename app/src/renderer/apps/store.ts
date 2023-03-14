import { calculateAnchorPointById } from './../logic/lib/position';
import { createContext, useContext } from 'react';

import {
  applyPatch,
  Instance,
  types,
  onSnapshot,
  applySnapshot,
} from 'mobx-state-tree';
import { RoomsAppState } from 'os/services/tray/rooms.model';
import {
  NetworkStoreType,
  ProtocolType,
  SharingMode,
  WalletCreationMode,
  WalletStore,
  WalletView,
} from 'os/services/tray/wallet-lib/wallet.model';

import { OSActions } from '../logic/actions/os';
import { DmApp } from './Messages/store';
import { Dimensions } from 'os/types';

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
    dmApp: DmApp,
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
    },
  }));

const loadSnapshot = () => {
  const localStore = localStorage.getItem('trayStore');
  if (localStore) return JSON.parse(localStore);
  return {};
};

const persistedState = loadSnapshot();

const walletAppDefault = {
  navState: {
    view: WalletView.NEW,
    protocol: ProtocolType.ETH_GORLI,
    lastEthProtocol: ProtocolType.ETH_GORLI,
    btcNetwork: NetworkStoreType.BTC_MAIN,
    transSend: false,
  },
  ethereum: {
    block: 0,
    gorliBlock: 0,
    protocol: ProtocolType.ETH_GORLI,
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
  activeApp: 'messages-tray',
  // activeApp: 'account-tray',
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
  dmApp: {
    currentView: 'dm-list',
  },
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

OSActions.onLogout((_event: any) => {
  applySnapshot(trayStore.walletApp, walletAppDefault);
});

// Listen for all patches
OSActions.onEffect((_event: any, value: any) => {
  if (value.response === 'initial') {
    if (value.resource === 'wallet') {
      applySnapshot(trayStore.walletApp, value.model);
    }
  }
  if (value.response === 'patch') {
    if (value.resource === 'wallet') {
      applyPatch(trayStore.walletApp, value.patch);
    }
  }
});

// After boot, set the initial data
OSActions.onBoot((_event: any, response: any) => {
  if (response.wallet) {
    applySnapshot(trayStore.walletApp, response.wallet);
  }
});
