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
    iceServers: [
      {
        urls: 'stun:coturn.holium.live:3478?transport=udp',
      },
      {
        urls: 'stun:coturn.holium.live:5349?transport=udp',
      },
      {
        username: 'realm',
        credential: 'zQzjNHC34Y8RqdLW',
        urls: 'turn:coturn.holium.live:5349?transport=udp',
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
let curPatp: string | null;

RoomsActions.onUpdate((_event: any, data: any, mark: string) => {
  if (protocol) {
    protocol.onSignal(data, mark);
  }
});

export function useRooms(our?: Patp) {
  if (roomsManager) {
    return roomsManager;
  }

  if (!roomsManager && our) {
    curPatp = our;
    roomsManager = createManager(our);
    OSActions.onLogout(() => {
      protocol = null;
      roomsManager = null;
      curPatp = null;
    });
    window.addEventListener('beforeunload', () => {
      roomsManager = null;
      curPatp = null;
      protocol = null;
    });
  }

  return roomsManager;
}

// export function useRooms(our?: Patp) {
//   let roomsManager = useContext(RoomsContext);
//   console.log('useRooms roomsManager', roomsManager?.local.patp);
//   if (roomsManager === null && our) {
//     const manager = createManager(our);
//     RoomsContext = createContext<null | RoomsManager>(manager);
//     roomsManager = manager;

// OSActions.onLogout(() => {
//   console.log('on logout');
//   RoomsContext = createContext<null | RoomsManager>(null);
//   RoomsProvider = RoomsContext.Provider;
//   roomsManager = null;
// });
// window.addEventListener('beforeunload', () => {
//   RoomsContext = createContext<null | RoomsManager>(null);
//   RoomsProvider = RoomsContext.Provider;
//   roomsManager = null;
// });
//   } else if (roomsManager === null) {
//     throw new Error('roomsManager not initialized');
//   }

//   return roomsManager;
// }
