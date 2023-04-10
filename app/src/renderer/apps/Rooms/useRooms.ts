import {
  RealmProtocol,
  ProtocolEvent,
  RoomsManager,
  RoomManagerEvent,
  RoomType,
} from '@holium/realm-room';
import { Patp } from 'os/types';
import { OSActions } from 'renderer/logic/actions/os';
import { RoomsActions } from 'renderer/logic/actions/rooms';
import { SoundActions } from 'renderer/logic/actions/sound';

const handlers = {
  scry: RoomsActions.scry,
  poke: RoomsActions.poke,
};

const config = {
  rtc: {
    // iceTransportPolicy: 'relay' as RTCIceTransportPolicy,
    iceServers: [
      // {
      //   username: 'realm',
      //   credential: 'zQzjNHC34Y8RqdLW',
      //   urls: 'stun:coturn.holium.live:3478',
      // },
      // {
      //   username: 'realm',
      //   credential: 'zQzjNHC34Y8RqdLW',
      //   urls: 'turn:coturn.holium.live:5349?transport=tcp',
      // },
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
  protocol = new RealmProtocol(our, config, handlers);
  const manager = new RoomsManager(protocol);

  // These sounds are for the creator of the room
  manager.on(RoomManagerEvent.CreatedRoom, (room: RoomType) => {
    if (room.type !== 'data') SoundActions.playRoomEnter();
  });

  manager.on(RoomManagerEvent.DeletedRoom, (room: RoomType) => {
    console.log('MANAGER GOT DELETE');
    if (room.type !== 'data') SoundActions.playRoomLeave();
  });

  protocol.on(ProtocolEvent.RoomEntered, (room: RoomType) => {
    if (room.type !== 'data') SoundActions.playRoomEnter();
  });

  manager.on(RoomManagerEvent.LeftRoom, (room: RoomType) => {
    if (room.type !== 'data') SoundActions.playRoomLeave();
  });

  // These sounds are for peer events
  protocol.on(ProtocolEvent.PeerAdded, (room: RoomType) => {
    if (room.type !== 'data') SoundActions.playRoomPeerEnter();
  });

  protocol.on(ProtocolEvent.PeerRemoved, (room: RoomType) => {
    if (room.type !== 'data') SoundActions.playRoomPeerLeave();
  });

  protocol.getSession();

  return manager;
};

let roomsManager: RoomsManager | null;

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
OSActions.onLogout(() => clearProtocolAndManager());
OSActions.onSleep(() => clearProtocolAndManager());
// we have to signal back that we are ready to actually quit with OSActions.readyToQuit
OSActions.onQuitSignal(clearProtocolAndManager);

RoomsActions.onUpdate((_event: any, data: any, mark: string) => {
  if (protocol) {
    protocol.onSignal(data, mark);
  }
});

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
