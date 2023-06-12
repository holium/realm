import { EventEmitter } from 'events';
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

export class LocalPeer extends EventEmitter {
  @observable patp = '';
  @observable audioLevel = 0;
  @observable isMuted = false;
  @observable isSpeaking = false;
  @observable isVideoOn = false;
  @observable status: PeerConnectionState = PeerConnectionState.New;
  @observable audioStream: MediaStream | undefined = undefined;
  @observable videoStream: MediaStream | undefined = undefined;
  @observable screenStream: MediaStream | undefined = undefined;
  @observable analysers: IAudioAnalyser[] = [];
  @observable devices:
    | {
        audioInput: string;
        audioOutput: string;
        videoInput: string;
      }
    | undefined;

  constructor(ourId: string) {
    super();
    makeObservable(this);
    this.patp = ourId;
  }

  @action
  init(our: string) {
    this.patp = our;
    return this;
  }

  @action
  mute() {
    this.isMuted = true;
    this.audioStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = false;
    });
  }

  @action
  unmute() {
    this.isMuted = false;
    this.audioStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = true;
    });
  }

  get hasVideo() {
    return this.isVideoOn;
  }

  @action
  async enableAudio() {
    if (this.audioStream && this.audioStream.getAudioTracks().length > 0) {
      this.audioStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = true;
      });
      this.isMuted = false;
      return this.audioStream;
    } else {
      const storedDeviceId = localStorage.getItem('rooms-audio-input');
      const audio = await navigator.mediaDevices
        .getUserMedia({
          audio: storedDeviceId
            ? {
                ...DEFAULT_AUDIO_OPTIONS,
                deviceId: { exact: storedDeviceId },
              }
            : DEFAULT_AUDIO_OPTIONS,
          video: false,
        })
        .then(this.setAudioStream.bind(this))
        .catch((err: any) => {
          console.log('enableAudio failed on navigator.mediaDevices', err);
        });
      if (audio) {
        this.audioStream = audio;
        this.analysers[0] = SpeakingDetectionAnalyser.initialize(this);
        this.status = PeerConnectionState.Broadcasting;
        return this.audioStream;
      } else {
        throw new Error('Could not enable audio');
      }
    }
  }

  @action setAudioStream(stream: MediaStream) {
    this.audioStream = stream;
    this.isMuted = false;
    return this.audioStream;
  }

  @action
  async disableAudio(): Promise<MediaStream | void> {
    this.audioStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = false;
      track.stop();
    });
    this.isMuted = true;
    this.audioStream = undefined;
  }

  @action
  async enableVideo() {
    this.isVideoOn = true;
    if (this.videoStream && this.videoStream.getVideoTracks().length > 0) {
      this.videoStream.getVideoTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = true;
      });
      return this.videoStream;
    } else {
      const storedDeviceId = localStorage.getItem('rooms-video-input');
      return await navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: storedDeviceId
            ? {
                deviceId: storedDeviceId,
              }
            : true,
        })
        .then(this.setVideoStream.bind(this))
        .catch((err: any) => {
          console.log('enableVideo failed on navigator.mediaDevices', err);
          this.isVideoOn = false;
        });
    }
  }

  @action
  setVideoStream(stream: MediaStream) {
    this.videoStream = stream;
    const video = document.getElementById(
      `peer-video-${this.patp}`
    ) as HTMLVideoElement;

    if (video) {
      video.style.display = 'inline-block';
      video.srcObject = stream;
    }
    return this.videoStream;
  }

  @action
  disableVideo(): void {
    this.isVideoOn = false;
    this.videoStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = false;
      track.stop();
    });
    const videoEl = document.getElementById(
      `peer-video-${this.patp}`
    ) as HTMLVideoElement;
    if (videoEl) {
      videoEl.style.display = 'none';
      videoEl.srcObject = null;
    }
    this.videoStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
      track.stop();
    });
    this.videoStream = undefined;
  }

  @action
  setStatus(status: PeerConnectionState) {
    this.status = status;
  }

  @action
  isSpeakingChanged(isSpeaking: boolean) {
    if (!this.isMuted) {
      this.isSpeaking = isSpeaking;
      this.emit('isSpeakingChanged', isSpeaking);
    } else if (this.isSpeaking) {
      this.isSpeaking = false;
      this.emit('isSpeakingChanged', false);
    }
  }

  @action
  setAudioInputDevice(deviceId: string) {
    localStorage.setItem('rooms-audio-input', deviceId);
    // if (this.stream?.active) {
    //   this.disableMedia();
    //   this.constraints.audio = {
    //     ...(this.constraints.audio as MediaTrackConstraints),
    //     deviceId: {
    //       exact: deviceId,
    //     },
    //   };
    //   this.enableMedia({
    //     audio: this.constraints.audio,
    //     video: this.constraints.video,
    //   });
    // }
  }

  @action
  setVideoInputDevice(deviceId: string) {
    localStorage.setItem('rooms-video-input', deviceId);
  }

  // TODO
  @action
  setAudioOutputDevice(deviceId: string) {
    localStorage.setItem('rooms-audio-output', deviceId);
    // setup new audio output device
  }

  @action
  clearTracks() {
    this.audioStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.stop();
    });
    this.audioStream = undefined;
  }

  @action
  disableAll() {
    this.videoStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
      track.stop();
    });
    this.isVideoOn = false;
    this.videoStream = undefined;
    this.audioStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.stop();
    });
    this.audioStream = undefined;
  }
}
