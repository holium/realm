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
  stream: MediaStream | null = null;
  protocol: BaseProtocol;
  constraints: MediaStreamConstraints = {
    audio: DEFAULT_AUDIO_OPTIONS,
    video: false,
  };
  audioContext: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  bufferLength: number = 16;
  dataArray: Float32Array | null = null;
  currentFrameId: number = 0;

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
      .then(this.setMedia.bind(this))
      .catch((err: any) => {
        console.log('navigator.mediaDevices.getUserMedia error', err);
      });
  }

  draw() {
    if (
      this.analyser === null ||
      this.dataArray === null ||
      this.bufferLength === 0
    ) {
      console.log('LocalPeer.draw called with invalid internal state');
      return;
    }
    this.currentFrameId = requestAnimationFrame(this.draw);
    //window.cancelAnimationFrame(frameId);
    this.analyser?.getFloatTimeDomainData(this.dataArray);
    let total = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      // let v = dataArray[i] / 128.0;
      total += this.dataArray[i];
    }
    const avg = total / (this.analyser.fftSize * 1.0);
    console.log('average decibel => %o', avg);
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
    // start listening for talking
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;
    this.analyser.smoothingTimeConstant = 0.85;
    this.analyser.connect(this.audioContext.destination);
    // analyser.fftSize = 2048;
    this.bufferLength = this.analyser.fftSize = 16;
    // We can use Float32Array instead of Uint8Array if we want higher precision
    // const dataArray = new Float32Array(bufferLength);
    this.dataArray = new Float32Array(this.bufferLength);
    // canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    // const draw = function () {
    // };
    this.draw();
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
    this.stream = null;
  }
}
