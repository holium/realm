import { RealmProtocol, RoomsManager } from '@holium/realm-room';
import { Patp } from 'os/types';
import { createContext, useContext } from 'react';
import { RoomsActions } from 'renderer/logic/actions/rooms';

const handlers = {
  scry: RoomsActions.scry,
  poke: RoomsActions.poke,
};

const config = {
  rtc: {
    iceServers: [{ urls: ['stun:coturn.holium.live:3478'] }],
  },
};

export const createManager = (our: Patp) => {
  const protocol = new RealmProtocol(our, config, handlers);
  const manager = new RoomsManager(protocol);

  protocol.getSession();
  RoomsActions.onUpdate((_event: any, data: any, mark: string) => {
    protocol.onSignal(data, mark);
  });
  return manager;
};

const RoomsContext = createContext<null | RoomsManager>(null);

export const RoomsProvider = RoomsContext.Provider;
export function useRooms() {
  const roomsManager = useContext(RoomsContext);
  if (roomsManager === null) {
    throw new Error(
      'roomManager cannot be null, please add a context provider'
    );
  }

  return roomsManager;
}

// export function useRooms(our: Patp) {
//   const [roomManager, setRoomManager] = useState<RoomsManager | null>(null);

//   useEffect(() => {
//     if (!our) return;
//     console.log('useEffect');
//     const protocol = new RealmProtocol(our, config, handlers);
//     const manager = new RoomsManager(protocol);
//     protocol.getSession();
//     setRoomManager(manager);
//     RoomsActions.onUpdate((_event: any, data: any, mark: string) => {
//       protocol.onSignal(data, mark);
//     });

//     return () => {
//       // TODO disconnect on logout
//       // manager.protocol.;
//     };
//   }, [our]);

//   return roomManager;
// }

// if (diff.exit) {
//   SoundActions.playRoomLeave();
// }
// if (diff.enter) {
//   SoundActions.playRoomEnter();
// }
