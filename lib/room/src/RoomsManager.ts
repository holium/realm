import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { Patp, RoomState, RoomType } from './types';
import { BaseProtocol } from './connection/BaseProtocol';
import { RoomInstance } from './RoomInstance';
import { LocalPeer } from './peer/LocalPeer';

/**
 * RoomsManager: top level class for managing the rooms primitive
 */
export class RoomsManager extends (EventEmitter as new () => TypedEmitter<RoomsManagerEventCallbacks>) {
  local: LocalPeer;
  protocol: BaseProtocol;
  presentRoom?: RoomInstance;
  roomMap: Map<string, RoomType> = new Map();

  constructor(protocol: BaseProtocol) {
    // eslint-disable-next-line constructor-super
    super();
    this.protocol = protocol;
    this.local = new LocalPeer(this.protocol, this.protocol.our, {
      isHost: false,
      rtc: this.protocol.rtc,
    });
    this.protocol.registerLocal(this.local);

    makeObservable(this, {
      protocol: observable,
      presentRoom: observable,
      roomMap: observable,
      listRooms: action.bound,
      createRoom: action.bound,
      deleteRoom: action.bound,
      enterRoom: action.bound,
      leaveRoom: action.bound,
      setRoom: action.bound,
    });
  }

  get our(): Patp {
    return this.local.patp;
  }

  get currentRoom(): RoomInstance | undefined {
    return this.presentRoom;
  }

  get currentProtocol(): BaseProtocol {
    return this.protocol;
  }

  get rooms(): RoomType[] {
    return Array.from(this.roomMap.values());
  }

  setProvider(provider: string) {
    if (this.presentRoom?.state === RoomState.Connected) {
      throw new Error('Must leave current room before switching providers');
    }
    this.protocol.setProvider(provider);
  }

  setRoom(room: RoomType) {
    this.roomMap.set(room.rid, room);
  }

  async listRooms(): Promise<RoomType[]> {
    // returns the list of rooms from the current provider
    const rooms = await this.protocol.getRooms();
    rooms.forEach(this.setRoom);
    return rooms;
  }

  enterRoom(rid: string): RoomInstance {
    this.local.enableMedia();
    if (!this.rooms.find((room: RoomType) => room.rid === rid)) {
      throw new Error('Room not found');
    }
    if (rid === this.presentRoom?.rid) {
      return this.presentRoom;
    }

    if (this.presentRoom) {
      this.leaveRoom(this.presentRoom.rid);
    }
    // returns the list of rooms from the current provider
    this.presentRoom = new RoomInstance(rid, this.protocol);
    // this.presentRoom.started
    this.presentRoom.on(RoomState.Started, () => {
      this.presentRoom?.connect();
    });
    return this.presentRoom;
  }

  leaveRoom(rid: string) {
    if (this.presentRoom?.rid !== rid) {
      throw new Error('must be in the room to leave');
    }
    // this.local.disableMedia();
    this.presentRoom.leave();
    this.presentRoom = undefined;
  }

  createRoom() {
    // creates a room in the current provider
    // this.protocol.createRoom()
  }

  deleteRoom(rid: string) {
    // provider/admin action
    // this.protocol.deleteRoom(rid)
  }
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RoomsManagerEventCallbacks = {
  createdRoom: () => void;
  deletedRoom: (state: RoomState) => void;
  joinedRoom: () => void;
  leftRoom: () => void;
  setNewProvider: () => void;
};
