import { calculateAnchorPointById } from './../logic/lib/position';
import { createContext, useContext } from 'react';
import { Room, RoomState } from '@holium/realm-room';
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
import { WalletStore, WalletView } from 'os/services/tray/wallet.model';
import { SoundActions } from '../logic/actions/sound';
import { OSActions } from '../logic/actions/os';
import { Patp } from 'os/types';
import { SlipType } from 'os/services/slip.service';
import { RoomsActions } from 'renderer/logic/actions/rooms';
import { RoomDiff } from 'os/services/tray/rooms.service';
import { IpcMessageEvent } from 'electron';
import { DmApp } from './Messages/store';
import { toJS } from 'mobx';

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
    walletApp: WalletStore,
    dmApp: DmApp,
  })
  .actions((self) => ({
    setTrayAppCoords(coords: Instance<typeof TrayAppCoords>) {
      self.coords = coords;
    },
    setTrayAppDimensions(dimensions: Instance<typeof TrayAppDimensions>) {
      // const calculatedDimensions =
      self.dimensions = dimensions;
    },
    setActiveApp(
      appKey: TrayAppKeys | null,
      params?: {
        willOpen: boolean;
        position: any;
        anchorOffset: any;
        dimensions: any;
      }
    ) {
      self.activeApp = appKey;
      if (params?.willOpen) {
        const { position, anchorOffset, dimensions } = params;
        self.coords = calculateAnchorPointById(
          appKey!,
          anchorOffset,
          position,
          dimensions
        );
        self.dimensions = dimensions;
        // console.log(toJS(self.coords));
      }
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
  walletApp: {
    network: 'ethereum',
    currentView: WalletView.ETH_LIST,
    bitcoin: {
      settings: {
        defaultIndex: 0,
      },
    },
    ethereum: {
      network: 'gorli',
      settings: {
        defaultIndex: 0,
      },
      initialized: false,
    },
    creationMode: 'default',
    sharingMode: 'anybody',
    ourPatp: '~zod',
    lastInteraction: new Date()
  },
  dmApp: {
    currentView: 'dm-list',
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
export const TrayStateContext = createContext<null | TrayInstance>(trayStore);

export const TrayProvider = TrayStateContext.Provider;
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
    // @ts-ignore
    if (diff.exit) {
      SoundActions.playRoomLeave();
    }
    // @ts-ignore
    if (diff.enter) {
      SoundActions.playRoomEnter();
    }
  }
);

// Watch actions for sound trigger
// onAction(trayStore, (call) => {
//   if (call.path === '/roomsApp') {
//     if (call.name === '@APPLY_SNAPSHOT') return;
//     const patchArg = call.args![0][0];
//     if (patchArg.path === '/liveRoom') {
//       if (patchArg.op === 'replace') {
//         patchArg.value
//           ? SoundActions.playRoomEnter()
//           : SoundActions.playRoomLeave();
//         if (patchArg.value) {
//           // Entering or switching room
//           // const room = trayStore.roomsApp.knownRooms.get(patchArg.value);
//           // console.log('entering and switching to connect');
//           // if (room) {
//           //   if (LiveRoom.state === RoomState.Disconnected) {
//           //     // not init yet, so leave
//           //     // this case is hit if we boot realm and are still in a room from a previous session.
//           //     RoomsActions.leaveRoom(room.id);
//           //     return;
//           //   }
//           //   // LiveRoom.connect(room);
//           // }
//         }
//       }
//     }
//   }
// });

OSActions.onBoot((_event: any, response: any) => {
  if (response.loggedIn && response.ship) {
    // RoomsActions.resetLocal();
    // RoomsActions.exitRoom();
    // LiveRoom.leave();
    console.log('ON BOOT, LIVEROOM', response.ship);
    if (response.ship.patp) LiveRoom.init(response.ship.patp!);
  }
});

// After boot, set the initial data
OSActions.onConnected((_event: any, response: any) => {
  console.log('on connected');
  if (LiveRoom.state === 'disconnected') {
    console.log('LiveRoom.init in OSActions.onConnected ');
    LiveRoom.init(response.ship.patp!);
  }
  if (response.rooms) {
    // LiveRoom.init(response.ship.patp!);
    console.log('OSActions.onConnected', response.rooms);
    applySnapshot(trayStore.roomsApp, response.rooms);
    if (trayStore.roomsApp.liveRoom) {
      console.log(
        '210: if (trayStore.roomsApp.liveRoom) {',
        trayStore.roomsApp.liveRoom
      );
      const { liveRoom } = trayStore.roomsApp;
      if (liveRoom) {
        LiveRoom.connect(liveRoom);
      }
    }
  }
});

// OSActions.onLogout((_event: any) => {

// })

// OSActions.onEffect((_event: any, value: any) => {
//   if (value.response === 'initial') {
//     if (value.resource === 'ship') {
// RoomsActions.resetLocal();
// RoomsActions.exitRoom();
// LiveRoom.leave();
//       LiveRoom.init(value.model.patp!);
//     }
//   }
// });

// Listen for all patches
OSActions.onEffect((_event: any, value: any) => {
  if (value.response === 'patch') {
    if (value.resource === 'rooms') {
      applyPatch(trayStore.roomsApp, value.patch);
    }
    if (value.resource === 'wallet') {
      applyPatch(trayStore.walletApp, value.patch);
    }
  }
});
// After boot, set the initial data
OSActions.onBoot((_event: any, response: any) => {
  if (response.rooms) {
    applySnapshot(trayStore.roomsApp, response.rooms);
  }

  if (response.wallet) {
    applySnapshot(trayStore.walletApp, response.wallet);
  }
});
