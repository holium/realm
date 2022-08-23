import { EventEmitter } from 'events';
import type TypedEventEmitter from 'typed-emitter';
import { TrackEvent } from './events';
import { isFireFox, isSafari, isWeb } from '../utils';

const BACKGROUND_REACTION_DELAY = 5000;

// keep old audio elements when detached, we would re-use them since on iOS
// Safari tracks which audio elements have been "blessed" by the user.
const recycledElements: Array<HTMLAudioElement> = [];

export class Track extends (EventEmitter as new () => TypedEventEmitter<TrackEventCallbacks>) {
  kind: Track.Kind;

  attachedElements: HTMLMediaElement[] = [];

  isMuted: boolean = false;

  source: Track.Source;

  /**
   * sid is set after track is published to server, or if it's a remote track
   */
  sid?: Track.SID;

  /**
   * @internal
   */
  mediaStream?: MediaStream;

  /**
   * indicates current state of stream
   */
  streamState: Track.StreamState = Track.StreamState.Active;

  protected _mediaStreamTrack: MediaStreamTrack;

  protected _mediaStreamID: string;

  protected isInBackground: boolean;

  private backgroundTimeout: ReturnType<typeof setTimeout> | undefined;

  protected _currentBitrate: number = 0;

  protected constructor(mediaTrack: MediaStreamTrack, kind: Track.Kind) {
    super();
    this.kind = kind;
    this._mediaStreamTrack = mediaTrack;
    this._mediaStreamID = mediaTrack.id;
    this.source = Track.Source.Unknown;
    if (isWeb()) {
      this.isInBackground = document.visibilityState === 'hidden';
      document.addEventListener(
        'visibilitychange',
        this.appVisibilityChangedListener
      );
    } else {
      this.isInBackground = false;
    }
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

  /**
   * creates a new HTMLAudioElement or HTMLVideoElement, attaches to it, and returns it
   */
  attach(): HTMLMediaElement;

  /**
   * attaches track to an existing HTMLAudioElement or HTMLVideoElement
   */
  attach(element: HTMLMediaElement): HTMLMediaElement;
  attach(element?: HTMLMediaElement): HTMLMediaElement {
    let elementType = 'audio';
    if (this.kind === Track.Kind.Video) {
      elementType = 'video';
    }
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
        element = document.createElement(elementType) as HTMLMediaElement;
      }
    }

    if (!this.attachedElements.includes(element)) {
      this.attachedElements.push(element);
    }

    // even if we believe it's already attached to the element, it's possible
    // the element's srcObject was set to something else out of band.
    // we'll want to re-attach it in that case
    attachToElement(this._mediaStreamTrack, element);

    if (element instanceof HTMLAudioElement) {
      // manually play audio to detect audio playback status
      element
        .play()
        .then(() => {
          this.emit(TrackEvent.AudioPlaybackStarted);
        })
        .catch((e) => {
          this.emit(TrackEvent.AudioPlaybackFailed, e);
        });
    }

    this.emit(TrackEvent.ElementAttached, element);
    return element;
  }

  /**
   * Detaches from all attached elements
   */
  detach(): HTMLMediaElement[];

  /**
   * Detach from a single element
   * @param element
   */
  detach(element: HTMLMediaElement): HTMLMediaElement;
  detach(element?: HTMLMediaElement): HTMLMediaElement | HTMLMediaElement[] {
    // detach from a single element
    if (element) {
      detachTrack(this._mediaStreamTrack, element);
      const idx = this.attachedElements.indexOf(element);
      if (idx >= 0) {
        this.attachedElements.splice(idx, 1);
        this.recycleElement(element);
        this.emit(TrackEvent.ElementDetached, element);
      }
      return element;
    }

    const detached: HTMLMediaElement[] = [];
    this.attachedElements.forEach((elm) => {
      detachTrack(this._mediaStreamTrack, elm);
      detached.push(elm);
      this.recycleElement(elm);
      this.emit(TrackEvent.ElementDetached, elm);
    });

    // remove all tracks
    this.attachedElements = [];
    return detached;
  }

  stop() {
    this._mediaStreamTrack.stop();
    if (isWeb()) {
      document.removeEventListener(
        'visibilitychange',
        this.appVisibilityChangedListener
      );
    }
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

  // avoid flicker
  if (element.srcObject !== mediaStream) {
    element.srcObject = mediaStream;
    if ((isSafari() || isFireFox()) && element instanceof HTMLVideoElement) {
      // Firefox also has a timing issue where video doesn't actually get attached unless
      // performed out-of-band
      // Safari 15 has a bug where in certain layouts, video element renders
      // black until the page is resized or other changes take place.
      // Resetting the src triggers it to render.
      // https://developer.apple.com/forums/thread/690523
      setTimeout(() => {
        element.srcObject = mediaStream;
        // Safari 15 sometimes fails to start a video
        // when the window is backgrounded before the first frame is drawn
        // manually calling play here seems to fix that
        element.play().catch(() => {
          /* do nothing */
        });
      }, 0);
    }
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
