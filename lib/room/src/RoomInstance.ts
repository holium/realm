import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { Patp, RoomType, RoomState } from './types';

import { BaseProtocol } from './connection/BaseProtocol';
import { DataPacket } from './helpers/data';
import { ProtocolEvent } from './connection/events';

export class RoomInstance extends (EventEmitter as new () => TypedEmitter<RoomEventCallbacks>) {
  rid: string; // ~lomder-librun/Hey/1667915502757
  protocol: BaseProtocol;
  room!: RoomType;
  state: RoomState = RoomState.Disconnected;

  constructor(rid: string, protocol: BaseProtocol) {
    // eslint-disable-next-line constructor-super
    super();
    this.rid = rid;
    this.protocol = protocol;
    this.state = RoomState.Starting;
    // this.protocol.setProvider(rid.split('/')[0]);
    this.protocol.getRoom(this.rid).then(
      action((room: RoomType) => {
        this.room = room;
        this.state = RoomState.Started;
        this.emit(RoomState.Started);
      })
    );

    this.protocol.on(
      ProtocolEvent.RoomUpdated,
      action((room: RoomType) => {
        this.room = room;
      })
    );

    makeObservable(this, {
      state: observable,
      room: observable,
      connect: action.bound,
    });
  }

  get muteStatus() {
    return this.protocol.local?.isMuted;
  }

  getPeer(peer: Patp) {
    this.protocol.peers.get(peer);
  }

  mute() {
    this.protocol.local?.mute();
  }

  unmute() {
    this.protocol.local?.unmute();
  }

  get peerList(): Patp[] {
    return this.room.present.filter((patp: Patp) => patp !== this.protocol.our);
  }

  async connect() {
    await this.protocol.connect(this.room);
    this.state = RoomState.Connected;
    this.emit(RoomState.Connected);
  }

  leave() {
    this.protocol.leave();
  }

  addPresent(peer: Patp) {
    // POKE room agent
    this.room.present.push(peer);
  }

  removePresent(peer: Patp) {
    // POKE room agent
    const removeIdx = this.room.present.findIndex(
      (present: Patp) => present === peer
    );
    this.room.present.splice(removeIdx, 1);
  }

  mutePeer(patp: Patp) {}
  unmutePeer(patp: Patp) {}
  sendData(data: DataPacket) {
    // this.protocol.
  }
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RoomEventCallbacks = {
  started: () => void;
  connected: () => void;
  connectionStateChanged: (state: RoomState) => void;
  mediaDevicesChanged: () => void;
};
