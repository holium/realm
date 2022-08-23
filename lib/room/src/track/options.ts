import { TrackSource, TrackType } from '../room/types';

export namespace Track {
  export enum Kind {
    Audio = 'audio',
    Video = 'video',
    Unknown = 'unknown',
  }
  export type SID = string;
  export enum Source {
    Camera = 'camera',
    Microphone = 'microphone',
    ScreenShare = 'screen_share',
    ScreenShareAudio = 'screen_share_audio',
    Unknown = 'unknown',
  }

  export enum StreamState {
    Active = 'active',
    Paused = 'paused',
    Unknown = 'unknown',
  }

  export interface Dimensions {
    width: number;
    height: number;
  }
}

export interface TrackInfo {
  sid: string;
  type: TrackType;
  name: string;
  muted: boolean;
  /**
   * original width of video (unset for audio)
   * clients may receive a lower resolution version with simulcast
   */
  width: number;
  /** original height of video (unset for audio) */
  height: number;
  /** true if track is simulcasted */
  simulcast: boolean;
  /** true if DTX (Discontinuous Transmission) is disabled for audio */
  disableDtx: boolean;
  /** source of media */
  source: Track.Source;
  // layers: VideoLayer[];
  /** mime type of codec */
  mimeType: string;
  mid: string;
  // codecs: SimulcastCodecInfo[];
}

export interface AudioCaptureOptions {
  /**
   * specifies whether automatic gain control is preferred and/or required
   */
  autoGainControl?: ConstrainBoolean;

  /**
   * the channel count or range of channel counts which are acceptable and/or required
   */
  channelCount?: ConstrainULong;

  /**
   * A ConstrainDOMString object specifying a device ID or an array of device
   * IDs which are acceptable and/or required.
   */
  deviceId?: ConstrainDOMString;

  /**
   * whether or not echo cancellation is preferred and/or required
   */
  echoCancellation?: ConstrainBoolean;

  /**
   * the latency or range of latencies which are acceptable and/or required.
   */
  latency?: ConstrainDouble;

  /**
   * whether noise suppression is preferred and/or required.
   */
  noiseSuppression?: ConstrainBoolean;

  /**
   * the sample rate or range of sample rates which are acceptable and/or required.
   */
  sampleRate?: ConstrainULong;

  /**
   * sample size or range of sample sizes which are acceptable and/or required.
   */
  sampleSize?: ConstrainULong;
  volume?: number;
}

/**
 * Options when publishing tracks
 */
export interface TrackPublishOptions extends TrackPublishDefaults {
  /**
   * set a track name
   */
  name?: string;

  /**
   * Source of track, camera, microphone, or screen
   */
  source?: Track.Source;
}

export interface TrackPublishDefaults {
  /**
   * max audio bitrate, defaults to [[AudioPresets.speech]]
   */
  audioBitrate?: number;

  /**
   * dtx (Discontinuous Transmission of audio), defaults to true
   */
  dtx?: boolean;

  /**
   * use simulcast, defaults to true.
   * When using simulcast, LiveKit will publish up to three versions of the stream
   * at various resolutions.
   */
  simulcast?: boolean;

  /**
   * For local tracks, stop the underlying MediaStreamTrack when the track is muted (or paused)
   * on some platforms, this option is necessary to disable the microphone recording indicator.
   * Note: when this is enabled, and BT devices are connected, they will transition between
   * profiles (e.g. HFP to A2DP) and there will be an audible difference in playback.
   *
   * defaults to false
   */
  stopMicTrackOnMute?: boolean;
}
