import { createContext, useContext } from 'react';
import { Instance, types } from 'mobx-state-tree';
import { AssemblyAppState } from './assembly';
import { WalletStore } from 'renderer/apps/Wallet/store';

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

export const TrayAppStore = types
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
    assemblyApp: AssemblyAppState,
    walletApp: WalletStore,
  })
  .actions((self) => ({
    setTrayAppCoords(coords: Instance<typeof TrayAppCoords>) {
      self.coords = coords;
    },
    setTrayAppDimensions(dimensions: Instance<typeof TrayAppDimensions>) {
      self.dimensions = dimensions;
    },
    setActiveApp(appKey: TrayAppKeys | null) {
      self.activeApp = appKey;
    },
  }));

export const trayStore = TrayAppStore.create({
  activeApp: null,
  coords: {
    left: 0,
    bottom: 0,
  },
  dimensions: {
    width: 200,
    height: 200,
  },
  walletApp: {
    network: 'ethereum',
    currentView: 'ethereum:list',
    ethereum: {},
    bitcoin: {},
  },
  assemblyApp: {
    currentView: 'list',
    selected: undefined,
    // live: '~labruc-dillyx-lomder-librun/room/daily-work-chat',
    assemblies: [
      // {
      //   id: '~labruc-dillyx-lomder-librun/room/daily-work-chat',
      //   title: 'Daily work chat',
      //   host: '~labruc-dillyx-lomder-librun',
      //   people: [
      //     '~labruc-dillyx-lomder-librun',
      //     '~lomder-librun',
      //     '~lodlev-migdev',
      //     '~bus',
      //   ],
      //   cursors: true,
      //   private: false,
      // },
    ],
  },
});

// -------------------------------
// Create core context
// -------------------------------
export type TrayInstance = Instance<typeof TrayAppStore>;
const TrayStateContext = createContext<null | TrayInstance>(trayStore);

export const CoreProvider = TrayStateContext.Provider;
export function useTrayApps() {
  const store = useContext(TrayStateContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
