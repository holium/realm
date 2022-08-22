import { EventEmitter } from 'events';
import { LocalTrack } from '.';
// import log from '../../logger';
// import type { TrackInfo } from '../../proto/livekit_models';
import { TrackEvent } from './events';
// import LocalAudioTrack from './LocalAudioTrack';
// import RemoteAudioTrack from './RemoteAudioTrack';
import { Track, TrackInfo } from './options';

export class TrackPublication extends EventEmitter {
  kind: Track.Kind;

  trackName: string;

  trackSid: Track.SID;

  track?: LocalTrack;

  source: Track.Source;

  /** MimeType of the published track */
  mimeType?: string;

  /** dimension of the original published stream, video-only */
  dimensions?: Track.Dimensions;

  /** true if track was simulcasted to server, video-only */
  simulcasted?: boolean;

  /** @internal */
  trackInfo?: TrackInfo;

  protected metadataMuted: boolean = false;

  constructor(kind: Track.Kind, id: string, name: string) {
    super();
    this.kind = kind;
    this.trackSid = id;
    this.trackName = name;
    this.source = Track.Source.Unknown;
  }

  /** @internal */
  setTrack(track?: LocalTrack) {
    if (this.track) {
      this.track.off(TrackEvent.Muted, this.handleMuted);
      this.track.off(TrackEvent.Unmuted, this.handleUnmuted);
    }

    this.track = track;

    if (track) {
      // forward events
      track.on(TrackEvent.Muted, this.handleMuted);
      track.on(TrackEvent.Unmuted, this.handleUnmuted);
    }
  }

  get isMuted(): boolean {
    return this.metadataMuted;
  }

  get isEnabled(): boolean {
    return true;
  }

  get isSubscribed(): boolean {
    return this.track !== undefined;
  }

  /**
   * an [AudioTrack] if this publication holds an audio track
   */
  get audioTrack(): any | undefined {
    if (this.track instanceof LocalTrack) {
      return this.track;
    }
  }

  handleMuted = () => {
    this.emit(TrackEvent.Muted);
  };

  handleUnmuted = () => {
    this.emit(TrackEvent.Unmuted);
  };

  /** @internal */
  updateInfo(info: TrackInfo) {
    this.trackSid = info.sid;
    this.trackName = info.name;
    this.source = info.source;
    console.log(info);
    this.mimeType = info.mimeType;
    if (this.kind === Track.Kind.Video && info.width > 0) {
      this.dimensions = {
        width: info.width,
        height: info.height,
      };
      this.simulcasted = info.simulcast;
    }
    this.trackInfo = info;
    console.log('update publication info', { info });
  }
}

export namespace TrackPublication {
  export enum SubscriptionStatus {
    Subscribed = 'subscribed',
    NotAllowed = 'not_allowed',
    Unsubscribed = 'unsubscribed',
  }
}
