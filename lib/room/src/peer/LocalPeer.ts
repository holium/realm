import { BaseProtocol } from '../connection/BaseProtocol';
import { Patp } from '../types';
import { Peer, PeerConfig } from './Peer';

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
    // this.peerConn.onicecandidate = this.onIceCandidate;
  }

  // async createOffer() {
  //   return await this.peerConn.createOffer();
  // }

  // async setLocalDescription(offer: RTCLocalSessionDescriptionInit) {
  //   return await this.peerConn.setLocalDescription(offer);
  // }

  async awaitOffer() {}

  // onIceCandidate(event: RTCPeerConnectionIceEvent) {
  //   const message: any = {
  //     type: 'candidate',
  //     peer: this.patp,
  //     candidate: null,
  //   };
  //   if (event.candidate) {
  //     message.candidate = event.candidate.candidate;
  //     message.sdpMid = event.candidate.sdpMid;
  //     message.sdpMLineIndex = event.candidate.sdpMLineIndex;
  //   }
  //   this.protocol.sendSignal(message);
  //   // this.sendSignal(message);
  //   // this.peerConn.ontrack = (e) => (remoteVideo.srcObject = e.streams[0]);
  //   // localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  // }

  enableMedia(
    options: MediaStreamConstraints = {
      audio: DEFAULT_AUDIO_OPTIONS,
      video: false,
    }
  ) {
    navigator.mediaDevices
      .getUserMedia(options)
      .then(this.setMedia.bind(this))
      .catch((err: any) => {
        console.log('navigator.mediaDevices.getUserMedia error', err);
      });
  }

  setMedia(stream: MediaStream) {
    this.stream = stream;
    this.stream.getAudioTracks().map((audio: MediaStreamTrack) => {
      this.audioTracks.set(audio.id, audio);
      // this.peerConn.addTrack(audio, stream);
    });
    if (this.stream.getVideoTracks().length > 0) {
      this.stream.getVideoTracks().map((video: MediaStreamTrack) => {
        this.videoTracks.set(video.id, video);
        // this.peerConn.addTrack(video, stream);
      });
    }
  }

  disableMedia() {
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
    });
    this.videoTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
    });
  }
}
