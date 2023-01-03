import {
  RealmProtocol,
  ProtocolEvent,
  RoomsManager,
  RoomManagerEvent,
} from '@holium/realm-room';
import { Patp } from 'os/types';
import { createContext, useContext } from 'react';
import { RoomsActions } from 'renderer/logic/actions/rooms';
import { SoundActions } from 'renderer/logic/actions/sound';

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
    if (manager.state === 'connected') {
      // only play sound if we are already in the room
      SoundActions.playRoomPeerEnter();
    }
  });

  protocol.on(ProtocolEvent.PeerRemoved, () => {
    SoundActions.playRoomPeerLeave();
  });

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
