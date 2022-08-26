import { createContext, useContext } from 'react';
import { Room } from '@holium/realm-room';
import {
  applyPatch,
  Instance,
  types,
  onSnapshot,
  onAction,
  applySnapshot,
} from 'mobx-state-tree';

import { SlipActions } from './../logic/actions/slip';
import { RoomsAppState, RoomsModelType } from 'os/services/tray/rooms.model';
import { SoundActions } from '../logic/actions/sound';
import { OSActions } from '../logic/actions/os';
import { Patp } from 'os/types';
import { SlipType } from 'os/services/slip.service';
import { RoomsActions } from 'renderer/logic/actions/rooms';
import { RoomDiff } from 'os/services/tray/rooms.service';
import { IpcMessageEvent } from 'electron';

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
  roomsApp: {
    currentView: 'list',
    // outstandingRequest: false,
  },
  // roomsApp: (persistedState && persistedState.roomsApp) || {
  //   currentView: 'list',
  //   // rooms: [], TODO
  // },
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

// Set up room listeners
export const LiveRoom = new Room((to: Patp[], data: any) => {
  SlipActions.sendSlip(to, data);
});

SlipActions.onSlip((_event: Event, slip: SlipType) => {
  LiveRoom.onSlip(slip);
});

RoomsActions.onRoomUpdate(
  (_event: IpcMessageEvent, diff: RoomDiff, room: RoomsModelType) => {
    console.log('room diff in renderer', diff);
    LiveRoom.onDiff(diff, room);
  }
);

// Watch actions for sound trigger
onAction(trayStore, (call) => {
  if (call.path === '/roomsApp') {
    if (call.name === '@APPLY_SNAPSHOT') return;
    const patchArg = call.args![0][0];
    if (patchArg.path === '/liveRoom') {
      if (patchArg.op === 'replace') {
        patchArg.value
          ? SoundActions.playRoomEnter()
          : SoundActions.playRoomLeave();
        if (patchArg.value) {
          // Entering or switching room
          const room = trayStore.roomsApp.knownRooms.get(patchArg.value);
          console.log('etnering and switching to conenect');
          if (room) LiveRoom.connect(room);
        }
      }
    }
  }
});

// After boot, set the initial data
OSActions.onBoot((_event: any, response: any) => {
  LiveRoom.init(response.ship.patp!);
  if (response.rooms) {
    applySnapshot(trayStore.roomsApp, response.rooms);
    if (trayStore.roomsApp.liveRoom) {
      const { liveRoom } = trayStore.roomsApp;
      if (liveRoom) {
        LiveRoom.connect(liveRoom);
      }
    }
  }
});

// Listen for all patches
OSActions.onEffect((_event: any, value: any) => {
  if (value.response === 'patch') {
    if (value.resource === 'rooms') {
      applyPatch(trayStore.roomsApp, value.patch);
    }
  }
});
