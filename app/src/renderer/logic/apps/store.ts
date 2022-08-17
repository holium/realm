import { createContext, useContext } from 'react';
import {
  applyPatch,
  Instance,
  types,
  onSnapshot,
  onAction,
} from 'mobx-state-tree';

import { RoomsAppState } from 'os/services/tray/rooms.model';
import { SoundActions } from '../actions/sound';

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
    roomsApp: RoomsAppState,
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

const loadSnapshot = () => {
  const localStore = localStorage.getItem('trayStore');
  if (localStore) return JSON.parse(localStore);
  return {};
};

const persistedState = loadSnapshot();

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
  roomsApp: (persistedState && persistedState.roomsApp) || {
    currentView: 'list',
    // rooms: [], TODO
  },
});

// onAction(trayStore, (call) => {
//   console.log(call);
// });
// Watch actions for sound trigger
onAction(trayStore.roomsApp, (call) => {
  const patchArg = call.args![0][0];
  if (patchArg.path === '/liveRoom') {
    if (patchArg.op === 'replace') {
      patchArg.value
        ? SoundActions.playRoomEnter()
        : SoundActions.playRoomLeave();
    }
  }
});

onSnapshot(trayStore, (snapshot) => {
  localStorage.setItem('trayStore', JSON.stringify(snapshot));
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

window.electron.os.onEffect((_event: any, value: any) => {
  if (value.response === 'initial') {
    if (value.resource === 'rooms') {
      applyPatch(trayStore.roomsApp, value.model);
    }
  }
  if (value.response === 'patch') {
    if (value.resource === 'rooms') {
      applyPatch(trayStore.roomsApp, value.patch);
    }
  }
  // if (value.response === 'initial') {
  //   if (value.resource === 'auth') {
  //     // authState.authStore.initialSync(value);
  //   }
  // }
});
