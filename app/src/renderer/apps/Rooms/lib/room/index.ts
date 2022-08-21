import { Participant } from './../participant/index';
import { toJS } from 'mobx';
import { RoomsModelType } from 'os/services/tray/rooms.model';
/**
 * Room
 *
 * A room is a list of participants,
 * participants can stream various track types to the rooms participants.
 */
import { EventEmitter } from 'events';
import { SlipType } from 'os/services/slip.service';
import { Patp } from 'os/types';
import type TypedEmitter from 'typed-emitter';
import { LocalParticipant } from '../participant/local';
import { RemoteParticipant } from '../participant/remote';
import { ConnectionState, RoomEventCallbacks } from './types';
import { ParticipantEvent } from '../helpers/events';

const peerConnectionConfig = {
  iceServers: [{ urls: ['stun:coturn.holium.live:3478'] }],
};

export class Room extends (EventEmitter as new () => TypedEmitter<RoomEventCallbacks>) {
  state: ConnectionState = ConnectionState.Disconnected;
  our!: LocalParticipant;
  participants: Map<Patp, RemoteParticipant>;
  audio!: Map<Patp, any>;

  constructor() {
    super();
    this.participants = new Map();
  }

  connect(our: Patp, room: RoomsModelType) {
    this.state = ConnectionState.Connecting;
    this.our = new LocalParticipant(our);
    window.electron.os.slip.onSlip((_event: any, slip: SlipType) => {
      console.log('got slapped', slip.from, slip.data);
      if (this.state !== ConnectionState.Disconnected) {
        const peer = this.participants.get(slip.from);
        peer?.handleSlip(slip.data, this.our.patpId);
      } else {
        console.log('you dont need this for Rooms');
      }
    });
    console.log(toJS(room));
    room.present.forEach((peer: Patp) => {
      if (peer === this.our.patp) return;
      const remote = new RemoteParticipant(peer, peerConnectionConfig);
      this.participants.set(peer, remote);
      this.addParticipant(remote);
    });
    // Calling
  }

  // new peer joined
  addParticipant(peer: RemoteParticipant) {
    // Call or listen
    const isOfferer = this.our.patpId < peer.patpId;
    const mount = document.getElementById('audio-root')!;
    const audioEl = document.createElement('audio');
    mount.appendChild(audioEl);
    peer.registerAudio(audioEl);

    // peer.(audioEl);
    if (!isOfferer) {
      this.our.sendSignal(peer.patp, 'awaiting-offer', '');
    }
    peer.on(ParticipantEvent.Connected, () => {
      console.log('WE ARE CONNECTED BRUH');
    });
    // else {
    //   //   // wait for their call
    // }
    // const mount = document.getElementById('audio-root')!;
    // const audioEl = document.createElement('audio');
    // mount.appendChild(audioEl);
    // peer.call(audioEl);
  }

  kickParticipant(peer: Patp) {
    console.log(peer);
  }

  disconnect() {
    this.participants = new Map();
    this.state = ConnectionState.Disconnected;
  }
}
