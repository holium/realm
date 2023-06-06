import { action, makeObservable, observable } from 'mobx';

import { PeerConnectionState } from './room.types';
import { IAudioAnalyser, SpeakingDetectionAnalyser } from './SpeakingDetector';

export interface PeerConfig {
  isHost: boolean;
  rtc: RTCConfiguration;
}

export const DEFAULT_AUDIO_OPTIONS = {
  channelCount: {
    ideal: 2,
    min: 1,
  },
  sampleRate: 48000,
  sampleSize: 16,
  noiseSuppresion: true,
  echoCancellation: true,
  autoGainControl: false,
};

export class LocalPeer {
  @observable patp = '';
  @observable audioLevel = 0;
  @observable isMuted = false;
  @observable isSpeaking = false;
  @observable isVideoOn = false;
  @observable status: PeerConnectionState = PeerConnectionState.New;
  @observable videoTracks: Map<string, any> = new Map();
  @observable audioTracks: Map<string, any> = new Map();
  @observable stream: MediaStream | undefined = undefined;
  @observable constraints: MediaStreamConstraints = {
    audio: DEFAULT_AUDIO_OPTIONS,
    video: false,
  };
  @observable analysers: IAudioAnalyser[] = [];

  constructor(ourId: string) {
    makeObservable(this);
    this.patp = ourId;
    this.setMedia = this.setMedia.bind(this);
  }

  @action
  init(our: string) {
    this.patp = our;
    this.audioTracks = new Map();
    return this;
  }

  @action
  mute() {
    this.isMuted = true;
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.enabled = false;
    });
  }

  @action
  unmute() {
    this.isMuted = false;
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.enabled = true;
    });
  }

  get hasVideo() {
    return this.isVideoOn;
  }

  @action
  async enableVideo() {
    this.isVideoOn = true;
    this.constraints.video = true;
    return await this.enableMedia(this.constraints);
  }

  @action
  async disableVideo(): Promise<MediaStream | void> {
    this.isVideoOn = false;
    this.constraints.video = false;
    this.stream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = false;
      track.stop();
    });

    return await this.enableMedia(this.constraints);
  }

  @action
  setStatus(status: PeerConnectionState) {
    this.status = status;
  }

  @action
  isSpeakingChanged(speaking: boolean) {
    this.isSpeaking = speaking;
  }
  @action
  setAudioInputDevice(deviceId: string) {
    localStorage.setItem('rooms-audio-input', deviceId);
    if (this.stream?.active) {
      this.disableMedia();
      this.enableMedia({
        audio: {
          ...(this.constraints.audio as MediaTrackConstraints),
          deviceId: {
            exact: deviceId,
          },
        },
        video: this.constraints.video,
      });
    }
  }

  // TODO
  @action
  setAudioOutputDevice(deviceId: string) {
    localStorage.setItem('rooms-audio-output', deviceId);
  }

  @action
  clearTracks() {
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
    });
    this.audioTracks.clear();
  }

  @action
  pauseStream() {
    this.stream?.getTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = false;
    });
  }

  async enableMedia(
    options: MediaStreamConstraints = {
      audio: DEFAULT_AUDIO_OPTIONS,
      video: false,
    }
  ) {
    const storedDeviceId = localStorage.getItem('rooms-audio-input');
    if (storedDeviceId) {
      options.audio = {
        ...DEFAULT_AUDIO_OPTIONS,
        deviceId: { exact: storedDeviceId },
      };
    }
    return await navigator.mediaDevices
      .getUserMedia(options)
      .then(this.setMedia)
      .catch((err: any) => {
        console.log('navigator.mediaDevices.getUserMedia error', err);
      });
  }

  @action
  setMedia(stream: MediaStream) {
    if (this.stream && this.stream.active) {
      this.stream = stream;
      // if video constraints changed, we need to reattach the video track
      if (this.isVideoOn) {
        const video = document.getElementById(
          `peer-video-${this.patp}`
        ) as HTMLVideoElement;
        stream.getVideoTracks().forEach((track: MediaStreamTrack) => {
          this.videoTracks.set(track.id, track);
        });
        if (video) {
          video.style.display = 'inline-block';
          video.srcObject = stream;
        }
      } else {
        const videoEl = document.getElementById(
          `peer-video-${this.patp}`
        ) as HTMLVideoElement;
        if (videoEl) {
          videoEl.style.display = 'none';
          videoEl.srcObject = null;
        }
        this.stream.getVideoTracks().forEach((track: MediaStreamTrack) => {
          this.stream?.removeTrack(track);
          track.stop();
          this.videoTracks.delete(track.id);
        });
      }
    } else {
      this.stream = stream;
      this.stream.getAudioTracks().forEach((audio: MediaStreamTrack) => {
        this.audioTracks.set(audio.id, audio);
      });
      if (this.isVideoOn) {
        this.stream.getVideoTracks().forEach((video: MediaStreamTrack) => {
          this.videoTracks.set(video.id, video);
        });
      }
    }
    // initialize the speaking detection analyser
    this.analysers[0] = SpeakingDetectionAnalyser.initialize(this);
    this.status = PeerConnectionState.Broadcasting;
    return this.stream;
  }

  @action
  disableMedia() {
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
    });
    this.audioTracks.clear();
    this.videoTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
    });
    this.videoTracks.clear();

    this.analysers.forEach((analyser: IAudioAnalyser) => {
      analyser.detach();
    });
    this.stream = undefined;
  }
}
