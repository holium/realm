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
    const clearProtocolAndManager: () => void = () => {
      roomsManager.cleanup().then(() =>{
        protocol = null;
        roomsManager = null;
      })
    }
    OSActions.onLogout(clearProtocolAndManager);
    OSActions.onSleep(clearProtocolAndManager);
    OSActions.onQuit(() => {
      console.log('yooo we doin work here');
      //OSActions.readyToQuit();
    });

    OSActions.onWake(()=> {
      createManager(our);
    });
  }
  if (!roomsManager) {
    throw new Error('roomsManager not initialized');
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
