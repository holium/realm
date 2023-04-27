import {
  ProtocolEvent,
  RealmProtocol,
  RoomManagerEvent,
  RoomsManager,
} from '@holium/realm-room';

import { Patp } from 'os/types';
import { SoundActions } from 'renderer/lib/sound';
import { RealmIPC, RoomsIPC } from 'renderer/stores/ipc';

const config = {
  rtc: {
    iceServers: [
      {
        username: 'realm',
        credential: 'zQzjNHC34Y8RqdLW',
        urls: 'turn:coturn.holium.live:443?transport=tcp',
      },
      {
        username: 'realm',
        credential: 'zQzjNHC34Y8RqdLW',
        urls: 'turn:coturn.holium.live:3478?transport=udp',
      },
    ],
  },
};

let protocol: RealmProtocol | null;
export const createManager = (our: Patp) => {
  const handlers = {
    scry: RoomsIPC.scry as (...args: any[]) => Promise<any>,
    poke: RoomsIPC.poke as (...args: any[]) => Promise<any>,
  };
  protocol = new RealmProtocol(our, config, handlers);
  const manager = new RoomsManager(protocol);

  // These sounds are for the creator of the room
  manager.on(RoomManagerEvent.CreatedRoom, () => {
    SoundActions.playRoomEnter();
  });

  manager.on(RoomManagerEvent.DeletedRoom, () => {
    SoundActions.playRoomLeave();
  });

  protocol.on(ProtocolEvent.RoomEntered, () => {
    SoundActions.playRoomEnter();
  });

  manager.on(RoomManagerEvent.LeftRoom, () => {
    SoundActions.playRoomLeave();
  });

  // These sounds are for peer events
  protocol.on(ProtocolEvent.PeerAdded, () => {
    SoundActions.playRoomPeerEnter();
  });

  protocol.on(ProtocolEvent.PeerRemoved, () => {
    SoundActions.playRoomPeerLeave();
  });

  protocol.getSession();

  return manager;
};

let roomsManager: null | RoomsManager;

let clearingProtocolAndManager: boolean = false; // switch to ensure we only have one clear() running at a time and the "duplicates" no-op
const clearProtocolAndManager: (callback?: () => void) => void = (
  callback?: () => void
) => {
  if (roomsManager && !clearingProtocolAndManager) {
    clearingProtocolAndManager = true;
    roomsManager.cleanup().then(() => {
      protocol = null;
      roomsManager = null;
      clearingProtocolAndManager = false;
      if (callback) {
        callback();
      }
    });
  }
};
RealmIPC.onUpdate((update) => {
  if (update.type === 'logout') {
    clearProtocolAndManager();
  }
});
// OSActions.onLogout(() => clearProtocolAndManager());
// OSActions.onSleep(() => clearProtocolAndManager());
// we have to signal back that we are ready to actually quit with OSActions.readyToQuit
// OSActions.onQuitSignal(clearProtocolAndManager);

// RoomsIPC.onUpdate(({ data, mark }: { data: any; mark: string }) => {
//   console.log('rooms ipc update', data, mark);
//   if (protocol) {
//     protocol.onSignal(data, mark);
//   }
// });

export function useRooms(our?: Patp): RoomsManager {
  if (roomsManager) {
    return roomsManager;
  }

  if (!roomsManager && our) {
    roomsManager = createManager(our);
  }
  if (!roomsManager) {
    throw new Error('roomsManager not initialized');
  }

  return roomsManager;
}
