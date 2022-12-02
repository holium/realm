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
  volume: 1,
  noiseSuppresion: true,
  // echoCancellation: false,
  // autoGainControl: true,
};

export class LocalPeer extends Peer {
  stream?: MediaStream;
  protocol: BaseProtocol;

  constructor(protocol: BaseProtocol, our: Patp, config: PeerConfig) {
    super(our, config);
    this.protocol = protocol;
    makeObservable(this, {
      stream: observable,
      setMedia: action.bound,
    });
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
      peer.peer?.addTrack(track, currentStream);
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
