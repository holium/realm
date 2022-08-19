import { SlipActions } from './../../../../logic/actions/slip';
import { EventEmitter } from 'events';
import { Patp } from 'os/types';
import type TypedEmitter from 'typed-emitter';
import { isValidPatp, patp2dec } from 'urbit-ob';
import { RemoteParticipant } from './remote';

export enum ConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
}

export class Participant extends (EventEmitter as new () => TypedEmitter<ParticipantEventCallbacks>) {
  patp: Patp;
  patpId: number;
  audioLevel: number = 0;
  isMuted: boolean = false;
  isCursorSharing: boolean = false;
  isSpeaking: boolean = false;
  tracks: MediaStreamTrack[];
  connectionState: ConnectionState = ConnectionState.Disconnected;

  constructor(patp: string) {
    super();
    this.patp = patp;
    this.patpId = patp2dec(patp);
    this.tracks = [];
  }

  sendSignal(
    to: string,
    kind: 'ice-candidate' | 'offer' | 'answer' | 'awaiting-offer',
    payload: any
  ) {
    const json = { [kind]: payload };
    console.log('sending payload', json);
    SlipActions.sendSlip([to], JSON.stringify(json));
  }

  isCali(peer: RemoteParticipant) {
    console.log(this.patp, this.patpId, peer.patp, peer.patpId);
    return this.patpId < peer.patpId;
  }
}

export type ParticipantEventCallbacks = {};
