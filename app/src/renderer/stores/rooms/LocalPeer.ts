import { action, makeObservable, observable } from 'mobx';
import { patp2dec } from 'urbit-ob';

import { RemotePeer } from './RemotePeer';
import { PeerConnectionState, TrackKind } from './rooms.types';
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

type LocalPeerSetters = {
  setMuted: (isMuted: boolean) => void;
  setAudioLevel?: (audioLevel: number) => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setAudioAttached: (isAttached: boolean) => void;
};

export class LocalPeer {
  patp: string = '';
  patpId: number = 0;
  audioLevel: number = 0;
  isMuted: boolean = false;
  isSpeaking: boolean = false;
  status: PeerConnectionState = PeerConnectionState.New;
  audioTracks: Map<string, any> = new Map();
  stream: MediaStream | undefined = undefined;
  constraints: MediaStreamConstraints = {
    audio: DEFAULT_AUDIO_OPTIONS,
    video: false,
  };
  analysers: IAudioAnalyser[] = [];
  rtcConfig: RTCConfiguration = {
    iceServers: [
      {
        username: 'realm',
        credential: 'zQzjNHC34Y8RqdLW',
        urls: 'turn:coturn.holium.live:3478?transport=tcp',
      },
      {
        username: 'realm',
        credential: 'zQzjNHC34Y8RqdLW',
        urls: 'turn:coturn.holium.live:3478?transport=udp',
      },
    ],
  };
  setters: LocalPeerSetters = {
    setMuted: () => {},
    setSpeaking: () => {},
    setAudioAttached: () => {},
  };
  constructor() {
    makeObservable(this, {
      isMuted: observable,
      isSpeaking: observable,
      audioLevel: observable,
      audioTracks: observable,
      status: observable,
      stream: observable,
      mute: action.bound,
      unmute: action.bound,
      setStatus: action.bound,
      isSpeakingChanged: action.bound,
      setAudioInputDevice: action.bound,
      setAudioOutputDevice: action.bound,
      streamTracks: action.bound,
      clearTracks: action.bound,
      pauseStream: action.bound,
      enableMedia: action.bound,
      setMedia: action.bound,
      disableMedia: action.bound,
    });
  }

  init(our: string, setters: LocalPeerSetters, config: PeerConfig) {
    this.patp = our;
    this.patpId = patp2dec(our);
    this.rtcConfig = config.rtc;
    this.audioTracks = new Map();
    this.setters = setters;
    return this;
  }

  mute() {
    this.isMuted = true;
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.enabled = false;
    });
  }

  unmute() {
    this.isMuted = false;
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.enabled = true;
    });
  }

  setStatus(status: PeerConnectionState) {
    this.status = status;
  }

  isSpeakingChanged(speaking: boolean) {
    this.isSpeaking = speaking;
  }

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
  setAudioOutputDevice(deviceId: string) {
    localStorage.setItem('rooms-audio-output', deviceId);
  }

  /**
   * streamTracks: streams the tracks of the current stream to the peer
   *
   * @param peer
   * @returns
   */
  streamTracks(peer: RemotePeer) {
    if (!this.stream) {
      console.log('no stream to stream');
      return;
    }
    const currentStream: MediaStream = this.stream;
    console.log('current streams', this.stream.getTracks());
    console.log('peer streams', peer.spInstance?.streams);
    this.stream.getTracks().forEach((track: MediaStreamTrack) => {
      if (this.isMuted && track.kind === TrackKind.Audio) {
        track.enabled = false;
      }
      if (!peer.spInstance?.destroyed) {
        // console.log(`%streaming tracks to ${peer.patp}`);
        try {
          peer.spInstance?.addStream(currentStream);
          // peer.spInstance?.addTrack(track, currentStream);
        } catch (e) {
          // catches "Track has already been added to that stream."
          console.error(e);
        }
      } else {
        console.log('streamTracks: peer is destroyed');
      }
    });
  }

  clearTracks() {
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
    });
    this.audioTracks.clear();
  }

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
    if (this.stream) {
      return;
    }
    const storedDeviceId = localStorage.getItem('rooms-audio-input');
    if (storedDeviceId) {
      options.audio = {
        ...DEFAULT_AUDIO_OPTIONS,
        deviceId: { exact: storedDeviceId },
      };
    }
    navigator.mediaDevices
      .getUserMedia(options)
      .then(this.setMedia)
      .catch((err: any) => {
        console.log('navigator.mediaDevices.getUserMedia error', err);
      });
  }

  setMedia(stream: MediaStream) {
    this.stream = stream;
    this.stream.getAudioTracks().forEach((audio: MediaStreamTrack) => {
      this.audioTracks.set(audio.id, audio);
    });
    // initialize the speaking detection analyser
    this.analysers[0] = SpeakingDetectionAnalyser.initialize(this);
    this.status = PeerConnectionState.Broadcasting;
  }

  disableMedia() {
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
    });
    this.audioTracks.clear();
    this.analysers.forEach((analyser: IAudioAnalyser) => {
      analyser.detach();
    });
    this.stream = undefined;
  }
}
