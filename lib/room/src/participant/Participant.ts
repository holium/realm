import { EventEmitter } from 'events';
import type TypedEmitter from 'typed-emitter';
import { patp2dec } from 'urbit-ob';
import { CursorPayload, StatePayload } from '@holium/realm-multiplayer';
import { DisconnectReason } from '../room/types';
import { Room } from '../room';
import { Patp } from '../types';
import { ParticipantEvent } from './events';
import { TrackEvent } from '../track/events';
import { TrackPublication } from '../track';
import LocalTrackPublication from '../track/LocalTrackPublication';
import { Track } from '../track/Track';

export enum ConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
}

export enum ConnectionQuality {
  Excellent = 'excellent',
  Good = 'good',
  Poor = 'poor',
  Unknown = 'unknown',
}

export class Participant extends (EventEmitter as new () => TypedEmitter<ParticipantEventCallbacks>) {
  patp: Patp;
  patpId: number;
  audioLevel: number = 0;
  isMuted: boolean = false;
  isCursorSharing: boolean = false;
  isSpeaking: boolean = false;
  room: Room;
  tracks: Map<string, any>;
  audioTracks: Map<string, any>;
  videoTracks: Map<string, any>;
  private _connectionQuality: ConnectionQuality = ConnectionQuality.Unknown;

  constructor(patp: string, room: Room) {
    super();
    this.patp = patp;
    this.patpId = patp2dec(patp);
    this.room = room;
    this.audioTracks = new Map();
    this.videoTracks = new Map();
    this.tracks = new Map();
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
    this.room.sendSlip([to], JSON.stringify(json));
  }

  getTracks(): TrackPublication[] {
    return Array.from(this.tracks.values());
  }

  /**
   * Finds the first track that matches the source filter, for example, getting
   * the user's camera track with getTrackBySource(Track.Source.Camera).
   * @param source
   * @returns
   */
  getTrack(source: Track.Source): TrackPublication | undefined {
    if (source === Track.Source.Unknown) {
      return;
    }
    for (const [, pub] of this.tracks) {
      if (pub.source === source) {
        return pub;
      }
      if (pub.source === Track.Source.Unknown) {
        if (
          source === Track.Source.Microphone &&
          pub.kind === Track.Kind.Audio &&
          pub.trackName !== 'screen'
        ) {
          return pub;
        }
        if (
          source === Track.Source.Camera &&
          pub.kind === Track.Kind.Video &&
          pub.trackName !== 'screen'
        ) {
          return pub;
        }
        if (
          source === Track.Source.ScreenShare &&
          pub.kind === Track.Kind.Video &&
          pub.trackName === 'screen'
        ) {
          return pub;
        }
        if (
          source === Track.Source.ScreenShareAudio &&
          pub.kind === Track.Kind.Audio &&
          pub.trackName === 'screen'
        ) {
          return pub;
        }
      }
    }
    return undefined;
  }

  protected addTrackPublication(publication: TrackPublication) {
    // forward publication driven events
    publication.on(TrackEvent.Muted, () => {
      this.emit(ParticipantEvent.TrackMuted, publication);
    });

    publication.on(TrackEvent.Unmuted, () => {
      this.emit(ParticipantEvent.TrackUnmuted, publication);
    });

    const pub = publication;
    if (pub.track) {
      pub.track.sid = publication.trackSid;
    }

    this.tracks.set(publication.trackSid, publication);
    switch (publication.kind) {
      case Track.Kind.Audio:
        this.audioTracks.set(publication.track?.mediaStreamID!, publication);
        break;
      case Track.Kind.Video:
        this.videoTracks.set(publication.trackSid, publication);
        break;
      default:
        break;
    }
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
  //
  trackMuted: (publication: TrackPublication) => void;
  trackUnmuted: (publication: TrackPublication) => void;
  localTrackPublished: (publication: LocalTrackPublication) => void;
};
