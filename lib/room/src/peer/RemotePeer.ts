import SimplePeer from 'simple-peer';
import { action, makeObservable, observable } from 'mobx';
import { patp2dec } from 'urbit-ob';
import { Patp } from '../types';
import { DataPacket, DataPacket_Kind } from '../helpers/data';
import { Peer, PeerConfig } from './Peer';
import { PeerConnectionState, TrackKind } from './types';
import { PeerEvent } from './events';
import { isFireFox, isSafari } from '../utils';

export class RemotePeer extends Peer {
  our: Patp;
  peer: SimplePeer.Instance;
  isInitiator: boolean;
  isAudioAttached: boolean = false;
  isVideoAttached: boolean = false;
  sendSignal: (peer: Patp, data: SimplePeer.SignalData) => void;
  constructor(
    our: Patp,
    peer: Patp,
    config: PeerConfig & { isInitiator: boolean },
    sendSignal: (peer: Patp, data: SimplePeer.SignalData) => void
  ) {
    super(peer, config);
    this.our = our;
    this.isInitiator = config.isInitiator;
    this.sendSignal = sendSignal;
    this.peer = new SimplePeer({
      initiator: this.isInitiator,
      config: config.rtc,
      objectMode: true,
    });
    this.peer.on('connect', this._onConnect.bind(this));
    this.peer.on('close', this._onClose.bind(this));
    this.peer.on('error', this._onError.bind(this));
    this.peer.on('signal', this._onSignal.bind(this));
    this.peer.on('stream', this._onStream.bind(this));
    this.peer.on('track', this._onTrack.bind(this));
    this.peer.on('data', this._onData.bind(this));
    makeObservable(this, {
      peer: observable,
      isAudioAttached: observable,
      isVideoAttached: observable,
      attach: action.bound,
      detach: action.bound,
      removeTracks: action.bound,
      _onConnect: action.bound,
      _onClose: action.bound,
      _onError: action.bound,
      _onSignal: action.bound,
      _onStream: action.bound,
      _onTrack: action.bound,
      _onData: action.bound,
    });
  }

  static isInitiator(localPatpId: number, remotePatp: Patp) {
    return localPatpId < patp2dec(remotePatp);
  }

  _onConnect() {
    console.log('RemotePeer onConnect', this.patp);
    this.status = PeerConnectionState.Connected;
    this.emit(PeerEvent.Connected);
    this.sendData({
      kind: DataPacket_Kind.DATA,
      value: {
        data: {
          from: this.our,
          to: this.patp,
          msg: 'Hi',
        },
      },
    });
  }

  _onClose() {
    console.log('RemotePeer onClose');
    this.status = PeerConnectionState.Closed;
    this.removeTracks();
    this.emit(PeerEvent.Disconnected);
  }

  _onError(err: Error) {
    console.log('RemotePeer onError', err);
    this.status = PeerConnectionState.Failed;
    this.removeTracks();
    this.emit(PeerEvent.Failed);
  }

  _onSignal(data: SimplePeer.SignalData) {
    this.sendSignal(this.patp, data);
    if (this.status !== PeerConnectionState.Connected) {
      this.status = PeerConnectionState.Connecting;
    }
  }

  _onStream(stream: MediaStream) {
    console.log('RemotePeer onStream', stream);
    this.emit(PeerEvent.MediaStreamAdded, stream);
  }

  _onTrack(track: MediaStreamTrack, stream: MediaStream) {
    console.log(`${this.patp} streaming track`, track);
    this.tracks.set(track.id, track);
    if (track.kind === 'video') {
      stream.getVideoTracks().forEach((video: MediaStreamTrack) => {
        this.videoTracks.set(video.id, video);
        this.attach(video);
        this.emit(PeerEvent.VideoTrackAdded, stream, video);
      });
    }
    if (track.kind === 'audio') {
      stream.getAudioTracks().forEach((audio: MediaStreamTrack) => {
        this.audioTracks.set(audio.id, audio);
        this.attach(audio);
        this.emit(PeerEvent.AudioTrackAdded, stream, audio);
      });
    }
    console.log(this);
  }

  _onData(data: any) {
    console.log('RemotePeer onData', JSON.parse(data));
  }

  removeTracks() {
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
      this.detach(track);
      this.emit(PeerEvent.AudioTrackRemoved, track);
    });
    this.videoTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
      this.detach(track);
      this.emit(PeerEvent.VideoTrackRemoved, track);
    });
    this.tracks.clear();
    this.audioTracks.clear();
    this.videoTracks.clear();
  }

  sendData(data: DataPacket): void {
    if (this.status !== PeerConnectionState.Connected) {
      throw new Error("can't send data unless connected");
    }
    this.peer?.send(JSON.stringify(data));
  }

  hangup() {
    this.peer?.destroy();
  }

  attach(track: MediaStreamTrack): HTMLMediaElement {
    console.log(
      'element prior to attach',
      document.getElementById(`${track.kind}-${this.patp}`)
    );
    let element: HTMLMediaElement = this.getMediaElement(
      track.kind as TrackKind
    );
    element = attachToElement(track, element);
    if (element instanceof HTMLAudioElement) {
      this.isAudioAttached = true;
      element
        .play()
        .then(() => {
          this.emit(PeerEvent.AudioPlaybackStarted);
        })
        .catch((e) => {
          this.emit(PeerEvent.AudioPlaybackFailed, e);
        });
    } else if (element instanceof HTMLVideoElement) {
      this.isVideoAttached = true;
    }
    console.log('attached', element);
    return element;
  }

  detach(track: MediaStreamTrack): void {
    let elementId = `audio-${this.patp}`;
    if (track.kind === TrackKind.Video) {
      elementId = `video-${this.patp}`;
      this.isVideoAttached = false;
    } else {
      this.isAudioAttached = false;
    }
    const element: HTMLMediaElement | null = document.getElementById(
      elementId
    ) as HTMLMediaElement;
    console.log('detaching', element);
    if (element) {
      detachTrack(track, element);
    }
  }

  getMediaElement(kind: TrackKind): HTMLMediaElement {
    let elementType = 'audio';
    let element: HTMLMediaElement;
    if (kind === TrackKind.Video) {
      elementType = 'video';
      const elementId = `video-${this.patp}`;
      element = document.getElementById(elementId) as HTMLVideoElement;
      if (!element) {
        // if the element doesn't exist, create it
        element = document.createElement(elementType) as HTMLVideoElement;
        element.id = elementId;
      }
      element.autoplay = true;
    } else {
      const elementId = `audio-${this.patp}`;
      element = document.getElementById(elementId) as HTMLVideoElement;
      if (!element) {
        // if the element doesn't exist, create it
        element = document.createElement(elementType) as HTMLAudioElement;
        element.id = `audio-${this.patp}`;
      }
    }
    return element;
  }

  // init() {
  //   // Clear any previous listeners
  //   this.peerConn.ontrack = null;
  //   this.peerConn.onconnectionstatechange = null;
  //   this.peerConn.onicecandidate = null;
  //   this.peerConn.onicecandidateerror = null;
  //   this.peerConn.onicegatheringstatechange = null;
  //   this.peerConn.onnegotiationneeded = null;
  //   this.peerConn.ondatachannel = null;
  //   // Register new listeners
  //   this.peerConn.ontrack = this.onTrack;
  //   this.peerConn.onconnectionstatechange = this.onConnectionChange;
  //   this.peerConn.onicecandidate = this.onIceCandidate;
  //   this.peerConn.onicecandidateerror = this.onIceError;
  //   this.peerConn.onicegatheringstatechange = this.onGathering;
  //   this.peerConn.onnegotiationneeded = this.onNegotiation;
  //   this.peerConn.ondatachannel = (evt: RTCDataChannelEvent) => {
  //     evt.channel.send(JSON.stringify({ type: 'connected', data: null }));
  //     // this.dataChannel = evt.channel;
  //     // this.dataChannel.onmessage = this.handleDataMessage;
  //     // this.dataChannel.onopen = (evt: any) => {
  //     //   console.log('data channel open');
  //     // };
  //     // this.dataChannel.onclose = (evt: any) => {
  //     //   console.log('data channel closed');
  //     // };
  //   };
  //   this.peerConn.sctp
  // }

  // onTrack(event: RTCTrackEvent) {
  //   console.log('remote peer onTrack', event);
  // }

  // onConnectionChange(event: Event) {}

  // onIceCandidate(event: RTCPeerConnectionIceEvent) {
  //   if (event.candidate === null) return;
  //   let can = JSON.stringify(event.candidate!.toJSON());
  //   // this.sendSignal(this.patp, 'ice-candidate', can);
  // }

  // onIceError(event: Event) {
  //   console.log('ice candidate error', event);
  // }

  // onGathering(event: Event) {
  //   if (!event) return;
  //   if (!event.target) return;
  //   if (!(event.target instanceof RTCPeerConnection)) return;
  //   let connection: RTCPeerConnection = event.target;
  //   switch (connection.iceGatheringState!) {
  //     case 'gathering':
  //       /* collection of candidates has begun */
  //       // console.log('gathering');
  //       break;
  //     case 'complete':
  //       /* collection of candidates is finished */
  //       // console.log('complete');
  //       // this.waitInterval;
  //       break;
  //   }
  // }

  // async onNegotiation(event: Event) {
  //   // console.log('negneeded', event);
  // }
}

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

  //  avoid flicker
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
  // TODO autoplay
  element.autoplay = true;
  if (element instanceof HTMLVideoElement) {
    element.playsInline = true;
  }
  return element;
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
