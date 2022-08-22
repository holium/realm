import { SlipActions } from './../../../../logic/actions/slip';
import { EventEmitter } from 'events';
import { Patp } from 'os/types';
import type TypedEmitter from 'typed-emitter';
import { isValidPatp, patp2dec } from 'urbit-ob';
import { CursorPayload, StatePayload } from '@holium/realm-multiplayer';
import { DisconnectReason } from '../room/types';
import { ParticipantEvent } from './events';
import { RoomsModelType } from 'os/services/tray/rooms.model';
import { LocalTrack, Track } from '../track';
import { RemoteParticipant } from './remote';
import { Room } from '../room';

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
  room: Room;
  audio?: LocalTrack;

  constructor(patp: string, room: Room) {
    super();
    this.patp = patp;
    this.patpId = patp2dec(patp);
    this.room = room;
  }

  toggleMuted() {
    this.isMuted = !this.isMuted;
    this.emit('muteToggled', this.isMuted);
  }

  toggleCursors() {
    this.isCursorSharing = !this.isCursorSharing;
    this.emit('cursorToggled', this.isCursorSharing);
  }

  sendSignal(
    to: string,
    kind: 'ice-candidate' | 'offer' | 'answer' | 'awaiting-offer',
    payload: any
  ) {
    const json = { [kind]: payload };
    SlipActions.sendSlip([to], JSON.stringify(json));
  }

  /**
   * Finds the first track that matches the source filter, for example, getting
   * the user's camera track with getTrackBySource(Track.Source.Camera).
   * @param source
   * @returns
   */
  getTracks(): LocalTrack | MediaStreamTrack | undefined {
    return this.audio;
  }
}

export type ParticipantEventCallbacks = {
  // PeerConnectionState
  connected: () => void;
  disconnected: (reason?: DisconnectReason) => void;
  failed: () => void;
  new: () => void;
  closed: () => void;
  // Custom
  connecting: () => void;
  reconnecting: () => void;
  audioStreamAdded: (stream: MediaStream) => void;
  cursorUpdate: (payload: CursorPayload) => void;
  stateUpdate: (payload: StatePayload) => void;
  //
  cursorToggled: (isCursorSharing: boolean) => void;
  muteToggled: (isMuted: boolean) => void;
};
