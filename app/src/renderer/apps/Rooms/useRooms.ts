import {
  RealmProtocol,
  ProtocolEvent,
  RoomsManager,
  RoomManagerEvent,
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
export const createManager = (
  our: Patp,
  video?: boolean,
  type?: 'rooms' | 'campfire' | 'typing'
) => {
  protocol = new RealmProtocol(our, config, handlers);
  const manager = new RoomsManager(protocol, video, type);

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

let roomsManagers: RoomsManager[] = [];

let clearingProtocolAndManager: boolean = false; // switch to ensure we only have one clear() running at a time and the "duplicates" no-op
const clearProtocolAndManager: (callback?: () => void) => void = (
  callback?: () => void
) => {
  if (roomsManagers && !clearingProtocolAndManager) {
    clearingProtocolAndManager = true;
    Promise.all(
      roomsManagers.map(async (room) => {
        room.cleanup;
      })
    ).then(() => {
      protocol = null;
      roomsManagers = [];
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
  const manager = roomsManagers.find((room) => room.type === 'rooms');
  if (manager) {
    return manager;
  }

  let roomsManager: RoomsManager | null = null;
  if (!manager && our) {
    roomsManager = createManager(our, false, 'rooms');
    roomsManagers.push(roomsManager);
  }
  if (!roomsManager) {
    throw new Error('roomsManager not initialized');
  }

  return roomsManager;
}

export function useCampfire(our?: Patp): RoomsManager {
  const manager = roomsManagers.find((room) => room.type === 'campfire');
  if (manager) {
    return manager;
  }

  let roomsManager: RoomsManager | null = null;
  if (!manager && our) {
    roomsManager = createManager(our, false, 'campfire');
    roomsManagers.push(roomsManager);
  }
  if (!roomsManager) {
    throw new Error('roomsManager not initialized');
  }

  return roomsManager;
}

export function useTyping(our?: Patp): RoomsManager {
  const manager = roomsManagers.find((room) => room.type === 'typing');
  if (manager) {
    return manager;
  }

  let roomsManager: RoomsManager | null = null;
  if (!manager && our) {
    roomsManager = createManager(our, false, 'typing');
    roomsManagers.push(roomsManager);
  }
  if (!roomsManager) {
    throw new Error('roomsManager not initialized');
  }

  return roomsManager;
}
