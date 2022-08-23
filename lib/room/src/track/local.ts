import { RemoteParticipant } from '../participant/RemoteParticipant';
import Queue from 'async-await-queue';
import { EventEmitter } from 'events';
import { TrackEvent } from './events';
import type TypedEventEmitter from 'typed-emitter';
import { AudioCaptureOptions } from './options';
import { getEmptyAudioStreamTrack } from './utils';
import { DEFAULT_AUDIO_CONSTRAINTS } from '../participant/LocalParticipant';
import { Patp } from 'types';

const BACKGROUND_REACTION_DELAY = 5000;

// keep old audio elements when detached, we would re-use them since on iOS
// Safari tracks which audio elements have been "blessed" by the user.
const recycledElements: Array<HTMLAudioElement> = [];

export class LocalTrack extends (EventEmitter as new () => TypedEventEmitter<TrackEventCallbacks>) {
  sid?: Track.SID;
  kind: Track.Kind;
  attachedElements: HTMLMediaElement[] = [];
  isMuted: boolean = false;
  source: Track.Source;
  mediaStream?: MediaStream;
  streamState: Track.StreamState = Track.StreamState.Active;
  peers: Map<Patp, RemoteParticipant>;
  protected _mediaStreamTrack: MediaStreamTrack;
  protected _mediaStreamID: string;
  protected isInBackground: boolean;
  private backgroundTimeout: ReturnType<typeof setTimeout> | undefined;
  protected _currentBitrate: number = 0;
  protected _isUpstreamPaused: boolean = false;
  protected muteQueue: Queue;

  constructor(
    peers: Map<Patp, RemoteParticipant>,
    mediaTrack: MediaStreamTrack,
    kind: Track.Kind
  ) {
    super();
    this.kind = kind;
    this._mediaStreamTrack = mediaTrack;
    this._mediaStreamID = mediaTrack.id;
    this.source = Track.Source.Microphone;
    this.muteQueue = new Queue();
    this.peers = peers;
    this.isInBackground = document.visibilityState === 'hidden';
    document.addEventListener(
      'visibilitychange',
      this.appVisibilityChangedListener
    );
  }

  /** current receive bits per second */
  get currentBitrate(): number {
    return this._currentBitrate;
  }

  get mediaStreamTrack() {
    return this._mediaStreamTrack;
  }

  /**
   * @internal
   * used for keep mediaStream's first id, since it's id might change
   * if we disable/enable a track
   */
  get mediaStreamID(): string {
    return this._mediaStreamID;
  }

  async mute(): Promise<LocalTrack> {
    await this.muteQueue.run(async () => {
      this._mediaStreamTrack.stop();
    });
    this.isMuted = true;
    this.emit('muted');
    return this;
  }

  async unmute(): Promise<LocalTrack> {
    await this.muteQueue.run(async () => {
      if (this.source === Track.Source.Microphone) {
        console.log('reacquiring mic track');
        await this.restartTrack();
      }
    });
    this.isMuted = false;
    this.emit('unmuted');
    return this;
  }

  async restartTrack(options?: AudioCaptureOptions) {
    let constraints: MediaTrackConstraints | undefined;
    if (options) {
      const streamConstraints = { audio: options };
      if (typeof streamConstraints.audio !== 'boolean') {
        constraints = streamConstraints.audio;
      }
    }
    await this.restart(constraints);
  }

  // protected async restart(
  //   constraints?: MediaTrackConstraints
  // ): Promise<LocalTrack> {
  //   const track = await super.restart(constraints);
  //   this.checkForSilence();
  //   return track;
  // }

  protected async restart(
    constraints?: MediaTrackConstraints
  ): Promise<LocalTrack> {
    const streamConstraints: MediaStreamConstraints = {
      audio: false,
    };

    streamConstraints.audio = DEFAULT_AUDIO_CONSTRAINTS;

    // detach
    this.attachedElements.forEach((el) => {
      detachTrack(this._mediaStreamTrack, el);
    });
    this._mediaStreamTrack.removeEventListener('ended', this.handleEnded);
    // on Safari, the old audio track must be stopped before attempting to acquire
    // the new track, otherwise the new track will stop with
    // 'A MediaStreamTrack ended due to a capture failure`
    this._mediaStreamTrack.stop();

    // create new track and attach
    const mediaStream = await navigator.mediaDevices.getUserMedia(
      streamConstraints
    );
    const newTrack = mediaStream.getTracks()[0];
    newTrack.addEventListener('ended', this.handleEnded);

    if (this.peers) {
      this.peers.forEach(async (peer: RemoteParticipant) => {
        await peer.replaceAudioTrack(newTrack);
      });
      // Track can be restarted after it's unpublished
    }

    this._mediaStreamTrack = newTrack;

    await this.resumeUpstream();

    this.attachedElements.forEach((el) => {
      attachToElement(newTrack, el);
    });

    this.mediaStream = mediaStream;
    return this;
  }

  private handleEnded = () => {
    this.emit(TrackEvent.Ended, this);
  };

  async pauseUpstream() {
    this.muteQueue.run(async () => {
      if (this._isUpstreamPaused === true) {
        return;
      }
      this._isUpstreamPaused = true;
      this.emit(TrackEvent.UpstreamPaused, this);
      const emptyTrack = getEmptyAudioStreamTrack();
      const pausePromises = Array.from(this.peers.values()).map(
        (peer: RemoteParticipant) => peer.streamAudioTrack(emptyTrack)
      );
      await Promise.all(pausePromises);
    });
  }

  async resumeUpstream() {
    this.muteQueue.run(async () => {
      if (this._isUpstreamPaused === false) {
        return;
      }
      this._isUpstreamPaused = false;
      this.emit(TrackEvent.UpstreamResumed, this);
      const pausePromises = Array.from(this.peers.values()).map(
        (peer: RemoteParticipant) =>
          peer.streamAudioTrack(this._mediaStreamTrack)
      );
      await Promise.all(pausePromises);
    });
  }

  attach(element?: HTMLMediaElement): HTMLMediaElement {
    let elementType = 'audio';
    if (!element) {
      if (elementType === 'audio') {
        recycledElements.forEach((e) => {
          if (e.parentElement === null && !element) {
            element = e;
          }
        });
        if (element) {
          // remove it from pool
          recycledElements.splice(recycledElements.indexOf(element), 1);
        }
      }
      if (!element) {
        element = document.createElement(elementType) as HTMLAudioElement;
      }
    }

    if (!this.attachedElements.includes(element))
      this.attachedElements.push(element);

    attachToElement(this._mediaStreamTrack, element);

    if (element instanceof HTMLAudioElement) {
      // manually play audio to detect audio playback status
      element
        .play()
        .then(() => this.emit(TrackEvent.AudioPlaybackStarted))
        .catch((e) => this.emit(TrackEvent.AudioPlaybackFailed, e));
    }

    this.emit(TrackEvent.ElementAttached, element);
    return element;
  }

  /**
   * Detaches from all attached elements
   */
  // detach(element?: HTMLMediaElement): HTMLMediaElement | HTMLMediaElement[] {
  //   // detach from a single element
  //   if (element) {
  //     detachTrack(this._mediaStreamTrack, element);
  //     const idx = this.attachedElements.indexOf(element);
  //     if (idx >= 0) {
  //       this.attachedElements.splice(idx, 1);
  //       this.recycleElement(element);
  //       this.emit(TrackEvent.ElementDetached, element);
  //     }
  //     return element;
  //   }

  //   const detached: HTMLMediaElement[] = [];
  //   this.attachedElements.forEach((elm) => {
  //     detachTrack(this._mediaStreamTrack, elm);
  //     detached.push(elm);
  //     this.recycleElement(elm);
  //     this.emit(TrackEvent.ElementDetached, elm);
  //   });

  //   // remove all tracks
  //   this.attachedElements = [];
  //   return detached;
  // }

  stop() {
    this._mediaStreamTrack.stop();
    document.removeEventListener(
      'visibilitychange',
      this.appVisibilityChangedListener
    );
  }

  protected enable() {
    this._mediaStreamTrack.enabled = true;
  }

  protected disable() {
    this._mediaStreamTrack.enabled = false;
  }

  private recycleElement(element: HTMLMediaElement) {
    if (element instanceof HTMLAudioElement) {
      // we only need to re-use a single element
      let shouldCache = true;
      element.pause();
      recycledElements.forEach((e) => {
        if (!e.parentElement) {
          shouldCache = false;
        }
      });
      if (shouldCache) {
        recycledElements.push(element);
      }
    }
  }

  protected appVisibilityChangedListener = () => {
    if (this.backgroundTimeout) {
      clearTimeout(this.backgroundTimeout);
    }
    // delay app visibility update if it goes to hidden
    // update immediately if it comes back to focus
    if (document.visibilityState === 'hidden') {
      this.backgroundTimeout = setTimeout(
        () => this.handleAppVisibilityChanged(),
        BACKGROUND_REACTION_DELAY
      );
    } else {
      this.handleAppVisibilityChanged();
    }
  };

  protected async handleAppVisibilityChanged() {
    this.isInBackground = document.visibilityState === 'hidden';
  }
}

/** @internal */
export function attachToElement(
  track: MediaStreamTrack,
  element: HTMLMediaElement
) {
  let mediaStream: MediaStream;
  if (element.srcObject instanceof MediaStream) {
    mediaStream = element.srcObject;
  } else {
    mediaStream = new MediaStream();
  }

  // check if track matches existing track
  let existingTracks: MediaStreamTrack[];
  if (track.kind === 'audio') {
    existingTracks = mediaStream.getAudioTracks();
  } else {
    existingTracks = mediaStream.getVideoTracks();
  }
  if (!existingTracks.includes(track)) {
    existingTracks.forEach((et) => {
      mediaStream.removeTrack(et);
    });
    mediaStream.addTrack(track);
  }

  element.autoplay = true;
  if (element instanceof HTMLVideoElement) {
    element.playsInline = true;
  }
}

/** @internal */
export function detachTrack(
  track: MediaStreamTrack,
  element: HTMLMediaElement
) {
  if (element.srcObject instanceof MediaStream) {
    const mediaStream = element.srcObject;
    mediaStream.removeTrack(track);
    if (mediaStream.getTracks().length > 0) {
      element.srcObject = mediaStream;
    } else {
      element.srcObject = null;
    }
  }
}

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

export type TrackEventCallbacks = {
  message: () => void;
  muted: (track?: any) => void;
  unmuted: (track?: any) => void;
  ended: (track?: any) => void;
  updateSettings: () => void;
  updateSubscription: () => void;
  audioPlaybackStarted: () => void;
  audioPlaybackFailed: (error: Error) => void;
  audioSilenceDetected: () => void;
  visibilityChanged: (visible: boolean, track?: any) => void;
  videoDimensionsChanged: (dimensions: Track.Dimensions, track?: any) => void;
  elementAttached: (element: HTMLMediaElement) => void;
  elementDetached: (element: HTMLMediaElement) => void;
  upstreamPaused: (track: any) => void;
  upstreamResumed: (track: any) => void;
};
