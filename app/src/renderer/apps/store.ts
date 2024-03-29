import { createContext, useContext } from 'react';
import { Instance, onSnapshot, types } from 'mobx-state-tree';

import { Dimensions } from '@holium/design-system/util';

import {
  NetworkStoreType,
  ProtocolType,
  SharingMode,
  WalletCreationMode,
} from 'os/services/ship/wallet/wallet.types';
import { RealmIPC } from 'renderer/stores/ipc';
import { WalletStore } from 'renderer/stores/models/wallet.model';
import { TrayAppKey } from 'renderer/system/desktop/components/SystemBar/apps';

import { calculateAnchorPointById } from '../lib/position';
import { RoomsAppState } from './Rooms/rooms.model';
import { WalletScreen } from './Wallet/types';

const TrayAppCoords = types.model({
  left: types.number,
  bottom: types.number,
});

const TrayAppDimensions = types.model({
  width: types.number,
  height: types.number,
});

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
      appId: TrayAppKey | null,
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

const defaultSettings = {
  walletCreationMode: WalletCreationMode.DEFAULT,
  sharingMode: SharingMode.ANYBODY,
  defaultIndex: 0,
};

const defaultConversions = {
  usd: Promise.resolve(0),
};

export const walletAppDefault = {
  navState: {
    view: WalletScreen.ONBOARDING,
    protocol: ProtocolType.ETH_GORLI,
    lastEthProtocol: ProtocolType.ETH_GORLI,
    btcNetwork: NetworkStoreType.BTC_MAIN,
  },
  ethereum: {
    gorliBlock: 0,
    protocol: ProtocolType.ETH_GORLI,
    settings: defaultSettings,
    initialized: false,
    conversions: defaultConversions,
  },
  bitcoin: {
    block: 0,
    settings: defaultSettings,
    conversions: defaultConversions,
  },
  btctest: {
    block: 0,
    settings: defaultSettings,
    conversions: defaultConversions,
  },
  creationMode: 'default',
  sharingMode: 'anybody',
  lastInteraction: new Date(),
  initialized: false,
  settings: {
    passcodeHash: '',
  },
  forceActive: false,
  returnView: WalletScreen.ONBOARDING,
  ourPatp: '',
  passcodeHash: '',
  navHistory: [],
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
  walletApp: walletAppDefault as any,
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
