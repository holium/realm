import { PeerEvent } from './events';
import { BaseProtocol } from '../connection/BaseProtocol';
import { Patp } from '../types';
import { Peer, PeerConfig } from './Peer';
import { RemotePeer } from './RemotePeer';
import { PeerConnectionState, TrackKind } from './types';
import { action, makeObservable, observable } from 'mobx';
import { SpeakingDetectionAnalyser } from '../analysers';
import { IAudioAnalyser } from '../analysers/types';

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

export const DEFAULT_VIDEO_OPTIONS = {
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

export class LocalPeer extends Peer {
  stream: MediaStream | null = null;
  protocol: BaseProtocol;
  constraints: MediaStreamConstraints = {
    audio: false,
    video: false,
  };
  analysers: IAudioAnalyser[] = [];

  constructor(protocol: BaseProtocol, our: Patp, config: PeerConfig) {
    super(our, config);
    this.protocol = protocol;
    makeObservable(this, {
      stream: observable,
      setMedia: action.bound,
    });
    if (config.audio) {
      this.constraints.audio = DEFAULT_AUDIO_OPTIONS;
    }
    if (config.video) {
      this.constraints.video = DEFAULT_VIDEO_OPTIONS;
    }
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
        // video: this.constraints.video,
      });
    }
  }

  // TODO
  setAudioOutputDevice(deviceId: string) {
    localStorage.setItem('rooms-audio-output', deviceId);
  }

  setVideoInputDevice(deviceId: string) {
    localStorage.setItem('campfire-video-input', deviceId);
    if (this.stream?.active) {
      this.disableMedia();
      this.enableMedia({
        audio: this.constraints.audio,
        video: {
          ...(this.constraints.video as MediaTrackConstraints),
          deviceId: {
            exact: deviceId,
          },
        },
      });
    }
  }

  // TODO
  setVideoOutputDevice(deviceId: string) {
    localStorage.setItem('campfire-video-output', deviceId);
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
    this.stream.getTracks().forEach((track: MediaStreamTrack) => {
      if (this.isMuted && track.kind === TrackKind.Audio) {
        track.enabled = false;
      }
      if (!peer.peer?.destroyed) {
        // console.log(`%streaming tracks to ${peer.patp}`);
        try {
          peer.peer?.addTrack(track, currentStream);
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
      this.emit(PeerEvent.AudioTrackRemoved, track);
    });
    this.audioTracks.clear();
    this.videoTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
      this.emit(PeerEvent.VideoTrackRemoved, track);
    });
    this.videoTracks.clear();
  }

  pauseStream() {
    this.stream?.getTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = false;
    });
  }

  enableMedia(
    options: MediaStreamConstraints = {
      audio: DEFAULT_AUDIO_OPTIONS,
      // video: DEFAULT_VIDEO_OPTIONS,
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
    const storedVideoDeviceId = localStorage.getItem('campfire-video-input');
    if (storedVideoDeviceId) {
      options.video = {
        ...DEFAULT_VIDEO_OPTIONS,
        deviceId: { exact: storedVideoDeviceId },
      };
    }
    navigator.mediaDevices
      .getUserMedia(options)
      .then(this.setMedia.bind(this))
      .catch((err: any) => {
        console.log('navigator.mediaDevices.getUserMedia error', err);
      });
  }

  setMedia(stream: MediaStream) {
    this.stream = stream;
    this.stream.getAudioTracks().forEach((audio: MediaStreamTrack) => {
      this.audioTracks.set(audio.id, audio);
      this.emit(PeerEvent.AudioTrackAdded, stream, audio);
    });
    if (this.stream.getVideoTracks().length > 0) {
      this.stream.getVideoTracks().forEach((video: MediaStreamTrack) => {
        this.videoTracks.set(video.id, video);
        this.emit(PeerEvent.VideoTrackAdded, stream, video);
      });
    }
    // initialize the speaking detection analyser
    this.analysers[0] = SpeakingDetectionAnalyser.initialize(this);
    this.status = PeerConnectionState.Broadcasting;
  }

  disableMedia() {
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
      this.emit(PeerEvent.AudioTrackRemoved, track);
    });
    this.audioTracks.clear();
    this.videoTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
      this.emit(PeerEvent.VideoTrackRemoved, track);
    });
    this.videoTracks.clear();
    this.analysers.forEach((analyser: IAudioAnalyser) => {
      analyser.detach();
    });
    this.stream = null;
  }
}
