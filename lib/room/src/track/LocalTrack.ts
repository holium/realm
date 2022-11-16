import Queue from 'async-await-queue';
// import log from '../../logger';
// import DeviceManager from '../DeviceManager';
import { TrackEvent } from './events';
import { isMobile } from '../utils';
import { attachToElement, detachTrack, Track } from './Track';
import { getEmptyAudioStreamTrack, getEmptyVideoStreamTrack } from './utils';

export class LocalTrack extends Track {
  _sender?: RTCRtpSender;
  _codec?: VideoCodec;
  protected constraints: MediaTrackConstraints;
  protected reacquireTrack: boolean;
  protected providedByUser: boolean;
  protected muteQueue: Queue;

  protected constructor(
    mediaTrack: MediaStreamTrack,
    kind: Track.Kind,
    constraints?: MediaTrackConstraints,
    userProvidedTrack = false
  ) {
    super(mediaTrack, kind);
    this._mediaStreamTrack.addEventListener('ended', this.handleEnded);
    this.constraints = constraints ?? mediaTrack.getConstraints();
    this.reacquireTrack = false;
    this.providedByUser = userProvidedTrack;
    this.muteQueue = new Queue();
  }

  get id(): string {
    return this._mediaStreamTrack.id;
  }

  get dimensions(): Track.Dimensions | undefined {
    if (this.kind !== Track.Kind.Video) {
      return undefined;
    }

    const { width, height } = this._mediaStreamTrack.getSettings();
    if (width && height) {
      return {
        width,
        height,
      };
    }
    return undefined;
  }

  private _isUpstreamPaused: boolean = false;

  get isUpstreamPaused() {
    return this._isUpstreamPaused;
  }

  get isUserProvided() {
    return this.providedByUser;
  }

  // /**
  //  * @returns DeviceID of the device that is currently being used for this track
  //  */
  // async getDeviceId(): Promise<string | undefined> {
  //   // screen share doesn't have a usable device id
  //   if (this.source === Track.Source.ScreenShare) {
  //     return;
  //   }
  //   const { deviceId, groupId } = this._mediaStreamTrack.getSettings();
  //   const kind = this.kind === Track.Kind.Audio ? 'audioinput' : 'videoinput';

  //   return DeviceManager.getInstance().normalizeDeviceId(
  //     kind,
  //     deviceId,
  //     groupId
  //   );
  // }

  async mute(): Promise<LocalTrack> {
    this.setTrackMuted(true);
    return this;
  }

  async unmute(): Promise<LocalTrack> {
    this.setTrackMuted(false);
    return this;
  }

  async replaceTrack(
    track: MediaStreamTrack,
    userProvidedTrack = true
  ): Promise<LocalTrack> {
    if (!this._sender) {
      throw new Error('unable to replace an unpublished track');
    }

    // detach
    this.attachedElements.forEach((el) => {
      detachTrack(this._mediaStreamTrack, el);
    });
    this._mediaStreamTrack.removeEventListener('ended', this.handleEnded);
    // on Safari, the old audio track must be stopped before attempting to acquire
    // the new track, otherwise the new track will stop with
    // 'A MediaStreamTrack ended due to a capture failure`
    if (!this.providedByUser) {
      this._mediaStreamTrack.stop();
    }

    track.addEventListener('ended', this.handleEnded);
    console.debug('replace MediaStreamTrack');

    if (this._sender) {
      await this._sender.replaceTrack(track);
    }
    this._mediaStreamTrack = track;

    await this.resumeUpstream();

    this.attachedElements.forEach((el) => {
      attachToElement(track, el);
    });

    this.mediaStream = new MediaStream([track]);
    this.providedByUser = userProvidedTrack;
    return this;
  }

  protected async restart(
    constraints?: MediaTrackConstraints
  ): Promise<LocalTrack> {
    if (!constraints) {
      constraints = this.constraints;
    }
    console.debug('restarting track with constraints', constraints);

    const streamConstraints: MediaStreamConstraints = {
      audio: false,
      video: false,
    };

    if (this.kind === Track.Kind.Video) {
      streamConstraints.video = constraints;
    } else {
      streamConstraints.audio = constraints;
    }

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
    console.debug('re-acquired MediaStreamTrack');

    if (this._sender) {
      // Track can be restarted after it's unpublished
      await this._sender.replaceTrack(newTrack);
    }

    this._mediaStreamTrack = newTrack;

    await this.resumeUpstream();

    this.attachedElements.forEach((el) => {
      attachToElement(newTrack, el);
    });

    this.mediaStream = mediaStream;
    this.constraints = constraints;
    return this;
  }

  protected setTrackMuted(muted: boolean) {
    console.debug(`setting ${this.kind} track ${muted ? 'muted' : 'unmuted'}`);

    if (this.isMuted === muted && this._mediaStreamTrack.enabled !== muted) {
      return;
    }

    this.isMuted = muted;
    this._mediaStreamTrack.enabled = !muted;
    this.emit(muted ? TrackEvent.Muted : TrackEvent.Unmuted, this);
  }

  protected get needsReAcquisition(): boolean {
    return (
      this._mediaStreamTrack.readyState !== 'live' ||
      this._mediaStreamTrack.muted ||
      !this._mediaStreamTrack.enabled ||
      this.reacquireTrack
    );
  }

  protected async handleAppVisibilityChanged() {
    await super.handleAppVisibilityChanged();
    if (!isMobile()) return;
    console.debug(
      `visibility changed, is in Background: ${this.isInBackground}`
    );

    if (
      !this.isInBackground &&
      this.needsReAcquisition &&
      !this.isUserProvided &&
      !this.isMuted
    ) {
      console.debug(`track needs to be reaquired, restarting ${this.source}`);
      await this.restart();
      this.reacquireTrack = false;
    }
  }

  private readonly handleEnded = () => {
    if (this.isInBackground) {
      this.reacquireTrack = true;
    }
    this.emit(TrackEvent.Ended, this);
  };

  async pauseUpstream() {
    this.muteQueue.run(async () => {
      if (this._isUpstreamPaused) {
        return;
      }
      if (!this._sender) {
        console.warn('unable to pause upstream for an unpublished track');
        return;
      }

      this._isUpstreamPaused = true;
      this.emit(TrackEvent.UpstreamPaused, this);
      const emptyTrack =
        this.kind === Track.Kind.Audio
          ? getEmptyAudioStreamTrack()
          : getEmptyVideoStreamTrack();
      await this._sender.replaceTrack(emptyTrack);
    });
  }

  async resumeUpstream() {
    this.muteQueue.run(async () => {
      if (!this._isUpstreamPaused) {
        return;
      }
      if (!this._sender) {
        console.warn('unable to resume upstream for an unpublished track');
        return;
      }
      this._isUpstreamPaused = false;
      this.emit(TrackEvent.UpstreamResumed, this);

      await this._sender.replaceTrack(this._mediaStreamTrack);
    });
  }
}

const codecs = ['vp8', 'h264', 'av1'] as const;

export type VideoCodec = typeof codecs[number];
