import { PeerEvent } from './events';
import { BaseProtocol } from '../connection/BaseProtocol';
import { Patp } from '../types';
import { Peer, PeerConfig } from './Peer';
import { RemotePeer } from './RemotePeer';
import { PeerConnectionState, TrackKind } from './types';
import { action, makeObservable, observable } from 'mobx';

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

export class LocalPeer extends Peer {
  stream?: MediaStream;
  protocol: BaseProtocol;
  constraints: MediaStreamConstraints = {
    audio: DEFAULT_AUDIO_OPTIONS,
    video: false,
  };

  constructor(protocol: BaseProtocol, our: Patp, config: PeerConfig) {
    super(our, config);
    this.protocol = protocol;
    makeObservable(this, {
      stream: observable,
      setMedia: action.bound,
    });
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
        console.log(
          'streaming tracks, isAudioAttached?=',
          peer.isAudioAttached
        );
        // if (!peer.peer?.destroyed && !peer.isAudioAttached) {
        try {
          peer.peer?.addTrack(track, currentStream);
        } catch (e) {
          // catches "Track has already been added to that stream."
          console.error(e);
        }
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
      video: false,
    }
  ) {
    if (this.stream) {
      console.log('already have stream');
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
    this.stream = undefined;
  }
}
