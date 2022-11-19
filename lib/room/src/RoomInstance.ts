import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { Patp, RoomType, RoomState } from './types';

import { BaseProtocol } from './connection/BaseProtocol';
import { DataPacket } from './helpers/data';
import { ProtocolEvent } from './connection/events';
import { RemotePeer } from './peer/RemotePeer';

export class RoomInstance extends (EventEmitter as new () => TypedEmitter<RoomEventCallbacks>) {
  rid: string; // ~lomder-librun/Hey/1667915502757
  protected protocol: BaseProtocol;
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

  /**
   * mute - Mutes local peer
   */
  mute() {
    this.protocol.local?.mute();
  }

  /**
   * unmute - Unmutes local peer
   */
  unmute() {
    this.protocol.local?.unmute();
  }

  /**
   * muteStatus - Returns mute status of local peer
   */
  get muteStatus() {
    return this.protocol.local?.isMuted;
  }

  /**
   * connect - Connects to a room
   */
  async connect() {
    await this.protocol.connect(this.room);
    this.state = RoomState.Connected;
    this.emit(RoomState.Connected);
  }

  /**
   * leave - Leaves a room
   */
  leave() {
    this.protocol.leave();
  }

  /**
   * getPeers - Returns a single peer
   * @param peer: Patp (e.g. ~zod)
   */
  getPeer(peer: Patp): RemotePeer {
    return this.protocol.peers.get(peer) as RemotePeer;
  }

  /**
   * peers - Returns all peers
   * @returns RemotePeer[]
   */
  get peers() {
    return Array.from(this.protocol.peers.values());
  }

  /**
   * mutePeer - Mutes a peer
   * @param peer: Patp (e.g. ~zod)
   */
  mutePeer(peer: Patp) {
    this.protocol.peers.get(peer)?.mute();
  }

  /**
   * unmutePeer - Unmutes a peer
   * @param peer: Patp (e.g. ~zod)
   */
  unmutePeer(peer: Patp) {
    this.protocol.peers.get(peer)?.unmute();
  }

  /**
   * sendData - Sends data to all connected peers
   * @param data: DataPacket
   */
  sendData(data: DataPacket) {
    this.protocol.sendData(data);
  }
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RoomEventCallbacks = {
  started: () => void;
  connected: () => void;
  connectionStateChanged: (state: RoomState) => void;
  mediaDevicesChanged: () => void;
};
