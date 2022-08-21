import { SlipActions } from './../../../../logic/actions/slip';
import { EventEmitter } from 'events';
import { Patp } from 'os/types';
import type TypedEmitter from 'typed-emitter';
import { isValidPatp, patp2dec } from 'urbit-ob';
import { CursorPayload, StatePayload } from '@holium/realm-multiplayer';

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
    SlipActions.sendSlip([to], JSON.stringify(json));
  }
}

export type ParticipantEventCallbacks = {
  connecting: () => void;
  connected: () => void;
  reconnecting: () => void;
  disconnected: () => void;
  cursorUpdate: (payload: CursorPayload) => void;
  stateUpdate: (payload: StatePayload) => void;
};
