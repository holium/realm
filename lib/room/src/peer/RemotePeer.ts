import SimplePeer from 'simple-peer';
import { action, makeObservable, observable } from 'mobx';
import { Patp } from '../types';
import { DataPacket } from '../helpers/data';
import { Peer, PeerConfig } from './Peer';
import { PeerConnectionState, TrackKind } from './types';
import { PeerEvent } from './events';
import { isFireFox, isSafari } from '../utils';

const ACK_READY = 'ack-ready';
const READY = 'ready';
const WAITING = 'waiting';

type SignalData =
  | SimplePeer.SignalData
  | { type: 'ready' | 'ack-ready' | 'waiting'; from: Patp };
export class RemotePeer extends Peer {
  our: Patp;
  peer?: SimplePeer.Instance;
  isInitiator: boolean;
  isAudioAttached: boolean = false;
  isVideoAttached: boolean = false;
  rtcConfig: RTCConfiguration;
  readyStatus: 'ready' | 'waiting' | 'ack-ready';
  sendSignal: (peer: Patp, data: SignalData) => void;
  constructor(
    our: Patp,
    peer: Patp,
    config: PeerConfig & { isInitiator: boolean },
    sendSignal: (peer: Patp, data: SignalData) => void
  ) {
    super(peer, config);
    this.our = our;
    this.isInitiator = config.isInitiator;
    this.readyStatus = WAITING;
    this.sendSignal = sendSignal;
    this.rtcConfig = config.rtc;

    makeObservable(this, {
      peer: observable,
      isAudioAttached: observable,
      isVideoAttached: observable,
      readyStatus: observable,
      attach: action.bound,
      detach: action.bound,
      setStatus: action.bound,
      removeTracks: action.bound,
      createConnection: action.bound,
      dial: action.bound,
      _onConnect: action.bound,
      _onClose: action.bound,
      _onError: action.bound,
      _onSignal: action.bound,
      _onStream: action.bound,
      _onTrack: action.bound,
      _onData: action.bound,
      ready: action.bound,
      waiting: action.bound,
      onWaiting: action.bound,
    });
  }

  createConnection() {
    this.setStatus(PeerConnectionState.Connecting);
    this.peer?.removeAllListeners();
    // create the peer connection
    this.peer = new SimplePeer({
      initiator: this.isInitiator,
      config: this.rtcConfig,
      objectMode: true,
    });
    this.peer.on('connect', this._onConnect.bind(this));
    this.peer.on('close', this._onClose.bind(this));
    this.peer.on('error', this._onError.bind(this));
    this.peer.on('signal', this._onSignal.bind(this));
    this.peer.on('stream', this._onStream.bind(this));
    this.peer.on('track', this._onTrack.bind(this));
    this.peer.on('data', this._onData.bind(this));
  }

  get hasMuted() {
    return (
      this.audioTracks.size > 0 &&
      Array.from(this.audioTracks.values())[0].enabled === false
    );
  }

  dial() {
    this.setStatus(PeerConnectionState.Connecting);
    // if (!this.isInitiator) {
    //   console.log('dialing: initiator to send ready signal');
    //   // this.ready();
    // } else {
    //   console.log('dialing: waiting to send ready signal');
    //   this.waiting();
    // }
    if (this.isInitiator) {
      // console.log('dialing: initiator to send waiting signal');
      this.waiting();
      // this.ready();
    }
  }

  waiting() {
    // in some cases, the intiator has disconnected and reconnected
    // after the remote peer has sent a ready signal. In this case,
    // we need to send a waiting signal to the remote peer so that
    // it knows to send a ready signal again.
    console.log(`waiting: ${this.patp}`);
    this.readyStatus = WAITING;
    this.sendSignal(this.patp, { type: 'waiting', from: this.our });
  }

  onWaiting() {
    // only send ready again if we are closed or waiting
    if (
      this.status === PeerConnectionState.Closed ||
      this.status === PeerConnectionState.Disconnected ||
      // this.status === PeerConnectionState.Connecting ||
      this.readyStatus === WAITING
    ) {
      console.log('onWaiting:', this.patp, this.status, this.readyStatus);
      // console.log(`sending ready to ${this.patp}`);
      this.ready();
    }
  }

  ready() {
    // set ready status to ready so that we don't dial again
    // if we receive a waiting signal
    this.readyStatus = READY;
    console.log(`ready: ${this.patp}`);
    this.createConnection();
    this.sendSignal(this.patp, { type: READY, from: this.our });
  }

  onReady() {
    console.log(`onReady: ${this.patp}`);
    this.readyStatus = READY;
    this.createConnection();
  }

  peerSignal(data: SimplePeer.SignalData) {
    if (this.peer?.destroyed) {
      console.log(
        'peerSignal: peer destroyed, creating new connection',
        this.patp
      );
      // NOTE: this is a hack to get around latency issues in Urbit.
      // Sometimes a peer is destroyed and then a signal is received
      this.dial();
      // return;
      this.createConnection();
    }

    this.peer?.signal(data);
  }

  _onConnect() {
    // console.log('RemotePeer onConnect', this.patp);
    this.setStatus(PeerConnectionState.Connected);
    this.emit(PeerEvent.Connected);
    this.readyStatus = READY;
  }

  _onClose() {
    // console.log('RemotePeer onClose', this.patp);
    this.setStatus(PeerConnectionState.Closed);
    this.removeTracks();
    this.emit(PeerEvent.Closed);
    this.readyStatus = WAITING;
  }

  _onError(err: Error) {
    console.log('RemotePeer onError', err);
    this.setStatus(PeerConnectionState.Failed);
    this.removeTracks();
    this.emit(PeerEvent.Failed, err);
    this.readyStatus = WAITING;
  }

  _onSignal(data: SimplePeer.SignalData) {
    this.sendSignal(this.patp, data);
    if (this.status !== PeerConnectionState.Connected) {
      this.setStatus(PeerConnectionState.Connecting);
    }
  }

  _onStream(stream: MediaStream) {
    this.emit(PeerEvent.MediaStreamAdded, stream);
  }

  _onTrack(track: MediaStreamTrack, stream: MediaStream) {
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
  }

  _onData(data: any) {
    this.emit(PeerEvent.ReceivedData, JSON.parse(data));
  }

  setStatus(status: PeerConnectionState) {
    this.status = status;
  }

  sendData(data: DataPacket): void {
    if (this.status !== PeerConnectionState.Connected) {
      console.warn("can't send data unless connected");
      return;
    }
    this.peer?.send(JSON.stringify(data));
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

  hangup() {
    this.removeTracks();
    this.peer?.destroy();
  }

  attach(track: MediaStreamTrack): HTMLMediaElement {
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
    // console.log('attached', element);
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
    // console.log('detaching', element);
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
