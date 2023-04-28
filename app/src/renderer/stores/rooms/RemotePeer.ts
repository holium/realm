import { action, makeObservable, observable } from 'mobx';
import SimplePeer from 'simple-peer';
import { patp2dec } from 'urbit-ob';

import { RoomsIPC } from '../ipc';
import { LocalPeer } from './LocalPeer';
import { DataPacket, DataPayload, PeerConnectionState } from './rooms.types';

const DataPacketMuteStatus = 3;
const DataPacketSpeakingChanged = 4;

export enum TrackKind {
  Audio = 'audio',
  Video = 'video',
  Unknown = 'unknown',
}
type PeerSetters = {
  setMuted: (isMuted: boolean) => void;
  setAudioLevel?: (audioLevel: number) => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setAudioAttached: (isAttached: boolean) => void;
};
export class RemotePeer {
  patp: string;
  patpId: number;
  audioLevel: number = 0;
  isMuted: boolean = false;
  isSpeaking: boolean = false;
  audioTracks: Map<string, any>;
  status: PeerConnectionState = PeerConnectionState.New;
  isInitiator: boolean;
  localPeer: LocalPeer | null = null;
  spInstance: SimplePeer.Instance | null = null;
  rid: string;
  rtcConfig: any;
  isAudioAttached: boolean = false;
  isVideoAttached: boolean = false;
  sendDataToPeer: (data: Partial<DataPacket>) => void = () => {};
  setters: PeerSetters = {
    setMuted: () => {},
    setSpeaking: () => {},
    setAudioAttached: () => {},
  };

  constructor(
    rid: string,
    patp: string,
    localPeer: LocalPeer,
    sendDataToPeer: (data: Partial<DataPacket>) => void,
    setters: PeerSetters,
    config: { isInitiator: boolean; rtc: any }
  ) {
    this.rid = rid;
    this.patp = patp;
    this.setters = setters;
    this.isInitiator = config.isInitiator;
    this.localPeer = localPeer;
    this.patpId = patp2dec(patp);
    this.rtcConfig = config.rtc;
    this.audioTracks = new Map();
    this.sendDataToPeer = sendDataToPeer.bind(this);
    makeObservable(this, {
      isMuted: observable,
      isSpeaking: observable,
      audioLevel: observable,
      audioTracks: observable,
      status: observable,
      mute: action.bound,
      unmute: action.bound,
      setStatus: action.bound,
      isSpeakingChanged: action.bound,
      spInstance: observable,
      isAudioAttached: observable,
      isVideoAttached: observable,
      attach: action.bound,
      detach: action.bound,
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
      onWaiting: action.bound,
    });
  }

  createConnection() {
    // create the peer connection
    this.setStatus(PeerConnectionState.Connecting);
    if (this.spInstance?.connected) {
      this.spInstance?.removeAllListeners();
      this.spInstance?.destroy();
    }
    if (!this.localPeer) {
      throw new Error('No local peer created');
    }
    this.spInstance = new SimplePeer({
      initiator: this.isInitiator,
      config: this.rtcConfig,
      // stream: this.localPeer.stream,
      objectMode: true,
      trickle: true,
    });
    this.spInstance.on('connect', this._onConnect.bind(this));
    this.spInstance.on('close', this._onClose.bind(this));
    this.spInstance.on('error', this._onError.bind(this));
    this.spInstance.on('signal', this._onSignal.bind(this));
    this.spInstance.on('stream', this._onStream.bind(this));
    this.spInstance.on('track', this._onTrack.bind(this));
    this.spInstance.on('data', this._onData.bind(this));
  }

  sendSignal(data: SimplePeer.SignalData) {
    RoomsIPC.sendSignal(window.ship, this.patp, this.rid, data);
  }

  sendData(data: DataPacket): void {
    if (this.status !== PeerConnectionState.Connected) {
      console.warn("can't send data unless connected, still trying");
    }
    this.spInstance?.send(JSON.stringify(data));
  }

  dial() {
    this.setStatus(PeerConnectionState.New);
    // only the waiting peer sends the waiting signal
    if (!this.isInitiator) {
      this.createConnection();
      RoomsIPC.sendSignal(window.ship, this.patp, this.rid, {
        type: 'waiting',
        from: window.ship,
      });
    }
  }

  retry() {
    if (this.isInitiator) {
      RoomsIPC.sendSignal(window.ship, this.patp, this.rid, {
        type: 'retry',
        from: window.ship,
      });
    } else {
      this.createConnection();
      RoomsIPC.sendSignal(window.ship, this.patp, this.rid, {
        type: 'waiting',
        from: window.ship,
      });
    }
  }

  onWaiting() {
    if (this.isInitiator) {
      this.createConnection();
    }
  }

  peerSignal(data: SimplePeer.SignalData) {
    // TODO go through the flow where a peer is destroyed and attempts to reconnect
    if (!this.spInstance?.destroyed) {
      this.spInstance?.signal(data);
    } else {
      console.log('peerSignal: peer destroyed, not signaling', this.patp);
      this.setStatus(PeerConnectionState.Destroyed);
    }
  }

  _onConnect() {
    console.log('RemotePeer onConnect', this.patp);
    this.setStatus(PeerConnectionState.Connected);
    this.localPeer?.streamTracks(this);
    this.sendDataToPeer({
      kind: DataPacketMuteStatus,
      value: { data: this.localPeer?.isMuted },
    });
  }

  _onClose() {
    console.log('RemotePeer onClose', this.patp);
    this.setStatus(PeerConnectionState.Closed);
  }

  _onError(err: Error) {
    console.log('RemotePeer onError', this.patp, err);
    // @ts-ignore
    this.setStatus(PeerConnectionState.Failed);
  }

  _onSignal(data: SimplePeer.SignalData) {
    this.sendSignal(data);
    console.log('sendSignal', data.type, data);
    if (this.status !== PeerConnectionState.Connected) {
      this.setStatus(PeerConnectionState.Connecting);
    }
  }

  _onStream(stream: MediaStream) {
    console.log('_onStream:', this.patp, stream);
    this.setStatus(PeerConnectionState.Connected);
  }

  _onTrack(track: MediaStreamTrack, stream: MediaStream) {
    console.log('_onTrack track added', track.id, track, stream);
    if (track.kind === 'audio') {
      if (this.audioTracks.size > 0) {
        console.log('this.audioTracks.size > 0, rmeoving tracks', track.id);
        this.removeTracks();
      }
      this.audioTracks.set(track.id, track);
      this.attach(track);
      this.setStatus(PeerConnectionState.Connected);
    }
  }

  _onData(data: any) {
    console.log('RemotePeer onData', this.patp, data);
    // check if we have a stream from the peer
    if (data.kind === DataPacketMuteStatus) {
      const payload = data.value as DataPayload;
      if (payload.data) {
        this.mute();
      } else {
        this.unmute();
      }
    } else if (data.kind === DataPacketSpeakingChanged) {
      const payload = data.value as DataPayload;
      this.isSpeakingChanged(payload.data);
    }
  }

  removeTracks() {
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
      this.detach(track);
    });

    this.audioTracks.clear();
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

  isSpeakingChanged(speaking: boolean) {
    this.isSpeaking = speaking;
  }

  setStatus(status: PeerConnectionState) {
    this.status = status;
  }

  hangup() {
    this.removeTracks();
    this.spInstance?.destroy();
  }

  attach(track: MediaStreamTrack): HTMLMediaElement {
    let element: HTMLMediaElement = this.getMediaElement(
      track.kind as TrackKind
    );
    element = attachToElement(track, element);
    console.log(element);
    if (element instanceof HTMLAudioElement) {
      this.isAudioAttached = true;
      element
        .play()
        .then(() => {
          console.log('playing audio from peer', this.patp);
        })
        .catch((e) => {
          console.error('ERROR: playing audio from peer', this.patp, e);
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
  // if (element.srcObject !== mediaStream) {
  //   element.srcObject = mediaStream;
  //   if ((isSafari() || isFireFox()) && element instanceof HTMLVideoElement) {
  //     // Firefox also has a timing issue where video doesn't actually get attached unless
  //     // performed out-of-band
  //     // Safari 15 has a bug where in certain layouts, video element renders
  //     // black until the page is resized or other changes take place.
  //     // Resetting the src triggers it to render.
  //     // https://developer.apple.com/forums/thread/690523
  //     setTimeout(() => {
  //       element.srcObject = mediaStream;
  //       // Safari 15 sometimes fails to start a video
  //       // when the window is backgrounded before the first frame is drawn
  //       // manually calling play here seems to fix that
  //       element.play().catch(() => {
  //         /* do nothing */
  //       });
  //     }, 0);
  //   }
  // }
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
