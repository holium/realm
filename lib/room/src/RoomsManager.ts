/**
 * RoomsManager
 *
 * Top level class for managing the rooms primitive
 */
import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable, toJS } from 'mobx';
import { Patp, RoomState } from './types';
import { BaseProtocol } from './connection/BaseProtocol';
import { RoomInstance } from './RoomInstance';
import { LocalPeer } from './peer/LocalPeer';
import { RoomType } from './types';

export class RoomsManager extends (EventEmitter as new () => TypedEmitter<RoomsManagerEventCallbacks>) {
  local: LocalPeer;
  protocol: BaseProtocol;
  presentRoom?: RoomInstance;
  roomMap: Map<string, RoomType> = new Map();

  constructor(protocol: BaseProtocol) {
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

  get currentRoom() {
    return this.presentRoom;
  }

  get rooms() {
    return Array.from(this.roomMap.values());
  }

  setProvider(provider: string) {
    if (this.presentRoom?.state === RoomState.Connected) {
      throw new Error('Must leave current room before switching providers');
    }
    this.protocol.setProvider(provider);
  }

  setRoom(room: RoomType) {
    // provider/admin action
    this.roomMap.set(room.rid, room);
  }

  async listRooms() {
    // returns the list of rooms from the current provider
    const rooms = await this.protocol.getRooms();
    rooms.forEach(this.setRoom);
    return rooms;
  }

  enterRoom(rid: string) {
    this.local.enableMedia();
    if (!this.rooms.find((room: RoomType) => room.rid === rid)) {
      throw new Error('Room not found');
    }
    if (rid === this.presentRoom?.rid) return;

    if (this.presentRoom) {
      this.leaveRoom(this.presentRoom.rid);
    }
    // returns the list of rooms from the current provider
    this.presentRoom = new RoomInstance(rid, this.protocol);
    // this.presentRoom.started
    this.presentRoom.on(RoomState.Started, () => {
      this.presentRoom
        ?.connect(this.our)
        .then((peers) =>
          console.log('entered Room done', toJS(peers), toJS(this.local))
        );
    });
    return this.presentRoom;
  }

  leaveRoom(rid: string) {
    if (this.presentRoom?.rid !== rid) {
      throw new Error('must be in the room to leave');
    }
    this.local.disableMedia();
    this.presentRoom.removePresent(this.our);
    this.presentRoom.leave();
    this.presentRoom = undefined;
  }

  createRoom() {
    // creates a room in the current provider
  }

  deleteRoom() {
    // provider/admin action
  }
}

export type RoomsManagerEventCallbacks = {
  createdRoom: () => void;
  deletedRoom: (state: RoomState) => void;
  joinedRoom: () => void;
  leftRoom: () => void;
  setNewProvider: () => void;
};
