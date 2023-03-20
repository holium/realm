import { PeerEvent } from './../peer/events';
import { BaseProtocol, ProtocolConfig } from './BaseProtocol';
import { Patp, RoomType } from '../types';
import { ProtocolEvent } from './events';
import { action, makeObservable, observable } from 'mobx';

import { RemotePeer } from '../peer/RemotePeer';
import { LocalPeer } from '../peer/LocalPeer';
import { DataPacket } from '../helpers/data';

/**
 * TODO update this to use the new protocol interface
 */
export class TestProtocol extends BaseProtocol {
  createRoom(
    _title: string,
    _access: 'public' | 'private',
    _path: string | null
  ): RoomType {
    throw new Error('Method not implemented.');
  }
  // @ts-ignore
  deleteRoom(_rid: string): void {
    throw new Error('Method not implemented.');
  }
  kick(_peer: string): void {
    throw new Error('Method not implemented.');
  }
  sendChat(_content: string): void {
    throw new Error('Method not implemented.');
  }
  signaling: WebSocket;
  api: string;
  constructor(our: Patp, config: ProtocolConfig, api: string) {
    super(our, config);

    this.signaling = new WebSocket('ws://localhost:3100/ws');
    this.api = api;

    this.signaling.onmessage = this.onSignal.bind(this);
    this.signaling.onopen = () => {
      console.log('Test protocol signaling onopen');
    };
    makeObservable(this, {
      signaling: observable,
      onSignal: action.bound,
    });
    this.sendSignal = this.sendSignal.bind(this);
    this.emit(ProtocolEvent.Ready);
  }

  sendSignal(peer: Patp, msg: any): void {
    this.signaling.send(
      JSON.stringify({ from: this.local?.patp, to: peer, data: msg })
    );
  }

  onSignal(ev: MessageEvent) {
    const payload = JSON.parse(ev.data);
    if (payload['room-update']) {
      const roomUpdate = payload['room-update'];
      if (this.presentRoom && roomUpdate.room.rid === this.presentRoom.rid) {
        this.presentRoom = roomUpdate.room;
        if (roomUpdate.diff.enter && roomUpdate.diff.enter !== this.our) {
          const patp = roomUpdate.diff.enter;
          console.log('should dial', patp);
          this.dial(patp, false);
        }
        if (roomUpdate.diff.leave && roomUpdate.diff.leave !== this.our) {
          const patp = roomUpdate.diff.leave;
          console.log('should hangup', patp);
          const peer = this.peers.get(patp);
          if (peer) {
            peer.hangup();
          }
          this.peers.delete(patp);
        }
      } else {
        // we aren't in the room, so just set the value to the new room
        // @ts-ignore
        this.rooms = this.rooms.values().map((room: any) => {
          if (room.rid === roomUpdate.rid) {
            return roomUpdate.room;
          }
          return room;
        });
      }
      this.emit(ProtocolEvent.RoomUpdated, roomUpdate.room);
      return;
    }
    if (payload.from !== this.local?.patp) {
      const sender = this.peers.get(payload.from);
      sender?.peer?.signal(payload.data);
    }
  }

  registerLocal(local: LocalPeer) {
    this.local = local;
  }

  /**
   * No provider in local protocol
   *
   * @param provider
   * @returns string
   */
  async setProvider(provider: Patp): Promise<RoomType[]> {
    this.provider = provider;
    // @ts-ignore
    return this.rooms;
  }

  async getRooms(): Promise<RoomType[]> {
    const res = await fetch(this.api + '/rooms');
    this.rooms = await res.json();
    // @ts-ignore
    return this.rooms;
  }

  async getRoom(rid: string): Promise<RoomType> {
    // @ts-ignore
    const room = this.rooms.find((room) => room.rid === rid);
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  }

  async connect(room: RoomType): Promise<Map<Patp, RemotePeer>> {
    this.presentRoom = room;
    const peers = this.presentRoom.present.filter(
      (peer: Patp) => this.our !== peer
    );
    const remotePeers = await Promise.all(
      peers.map(
        async (peer: Patp) => await this.dial(peer, peer === room.creator)
      )
    );
    action(() => {
      this.peers = new Map(
        remotePeers.map(
          action((remotePeer) => {
            return [remotePeer.patp, remotePeer];
          })
        )
      );
    });

    await fetch(this.api + `/rooms/${room.rid}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patp: this.our }),
    });
    return this.peers;
  }

  /**
   * sendData - Send data to all peers
   * @param data: DataPacket
   */
  sendData(data: DataPacket) {
    this.peers.forEach((peer) => {
      peer.sendData(data);
    });
  }

  dial(peer: Patp, isHost: boolean): RemotePeer {
    if (!this.local) throw new Error('No local peer created');
    const remotePeer = new RemotePeer(
      this.our,
      peer,
      {
        isHost,
        // @ts-ignore
        isInitiator: RemotePeer.isInitiator(this.local.patpId, peer),
        rtc: this.rtc,
      },
      this.sendSignal
    );
    this.peers.set(remotePeer.patp, remotePeer);
    // When we connect, lets stream our local tracks to the remote peer
    remotePeer.on(PeerEvent.Connected, () => {
      this.local?.streamTracks(remotePeer);
    });

    return remotePeer;
  }

  async leave() {
    if (!this.presentRoom) {
      throw new Error('No room to leave');
    }
    await fetch(this.api + `/rooms/${this.presentRoom.rid}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patp: this.our }),
    });
    this.peers.clear();
    this.presentRoom = null;
  }
}
