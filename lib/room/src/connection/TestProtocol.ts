import { BaseProtocol, ProtocolConfig } from './BaseProtocol';
import { Patp, RoomType } from '../types';
import { ProtocolEvent } from './events';
import { autorun, action, makeObservable, observable } from 'mobx';

import { RemotePeer } from '../peer/RemotePeer';
import { LocalPeer } from '../peer/LocalPeer';

export const RTCConfig: RTCConfiguration = {
  iceServers: [{ urls: ['stun:coturn.holium.live:3478'] }],
  iceTransportPolicy: 'relay',
};

export class TestProtocol extends BaseProtocol {
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
    console.log('TestProtocol onSignal', payload);
    if (payload['room-update']) {
      const roomUpdate = payload['room-update'];
      if (this.presentRoom && roomUpdate.room.rid === this.presentRoom.rid) {
        this.presentRoom = roomUpdate.room;
        if (roomUpdate.diff['enter'] && roomUpdate.diff['enter'] !== this.our) {
          const patp = roomUpdate.diff['enter'];
          console.log('should dial', patp);
          this.dial(patp, false);
        }
        if (roomUpdate.diff['leave'] && roomUpdate.diff['leave'] !== this.our) {
          const patp = roomUpdate.diff['leave'];
          console.log('should hangup', patp);
          const peer = this.peers.get(patp);
          if (peer) {
            peer.hangup();
          }
          this.peers.delete(patp);
        }
      } else {
        // we aren't in the room, so just set the value to the new room
        this.rooms = this.rooms.map((room) => {
          if (room.rid === roomUpdate.rid) {
            return roomUpdate.room;
          }
          return room;
        });
      }
      return;
    }
    if (payload.from !== this.local?.patp) {
      const sender = this.peers.get(payload.from);
      console.log('onSignal', sender);
      sender?.peer.signal(payload.data);
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
    return this.rooms;
  }

  async getRooms(): Promise<RoomType[]> {
    const res = await fetch(this.api + '/rooms');
    this.rooms = await res.json();
    return this.rooms;
  }

  async getRoom(rid: string): Promise<RoomType> {
    return this.rooms.find((room: RoomType) => room.rid === rid)!;
  }

  async connect(room: RoomType): Promise<Map<Patp, RemotePeer>> {
    this.presentRoom = room;
    const peers = this.presentRoom.present.filter(
      (peer: Patp) => this.our !== peer
    );
    const remotePeers = await Promise.all(
      peers.map(async (peer: Patp) => this.dial(peer, peer === room.creator))
    );
    action(() => {
      this.peers = new Map(
        remotePeers.map((remotePeer) => {
          return [remotePeer.patp, remotePeer];
        })
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

  async dial(peer: Patp, isHost: boolean): Promise<RemotePeer> {
    const remotePeer = new RemotePeer(
      this.our,
      peer,
      {
        isHost,
        isInitiator: RemotePeer.isInitiator(this.local!.patpId, peer),
        rtc: this.rtc,
      },
      this.sendSignal
    );
    this.peers.set(remotePeer.patp, remotePeer);

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
    this.presentRoom = undefined;
    return;
  }
}
