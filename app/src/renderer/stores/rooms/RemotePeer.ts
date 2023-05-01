import { action, makeObservable, observable } from 'mobx';
import SimplePeer from 'simple-peer';
import { patp2dec } from 'urbit-ob';

import { RoomsIPC } from '../ipc';
import { LocalPeer } from './LocalPeer';
import {
  IAudioAnalyser,
  PeerSpeakingDetectionAnalyser,
} from './PeerSpeakingDetector';
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
  setStatus: (status: PeerConnectionState) => void;
  onDataChannel: (data: DataPacket) => void;
};

type ConnectionSetupOptions = {
  dataChannelOnly?: boolean;
};

export class RemotePeer {
  patp: string;
  patpId: number;
  audioLevel: number = 0;
  isMuted: boolean = false;
  isSpeaking: boolean = false;
  audioTracks: Map<string, any>;
  audioStream: MediaStream | null = null;
  status: PeerConnectionState = PeerConnectionState.New;
  isInitiator: boolean;
  localPeer: LocalPeer | null = null;
  spInstance: SimplePeer.Instance | null = null;
  rid: string;
  rtcConfig: any;
  isAudioAttached: boolean = false;
  isVideoAttached: boolean = false;
  analysers: IAudioAnalyser[] = [];
  sendDataToPeer: (data: Partial<DataPacket>) => void = () => {};
  setters: PeerSetters = {
    setMuted: () => {},
    setSpeaking: () => {},
    setAudioAttached: () => {},
    setStatus: () => {},
    onDataChannel: () => {},
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
    this.mute = this.mute.bind(this);
    this.unmute = this.unmute.bind(this);
    this.setStatus = this.setStatus.bind(this);
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
      // attach: action.bound,
      detach: action.bound,
      removeTracks: action.bound,
      createConnection: action.bound,
      dial: action.bound,
      onWaiting: action.bound,
    });
  }

  createConnection(_options?: ConnectionSetupOptions) {
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
      stream: this.localPeer.stream,
      objectMode: true,
      trickle: true,
    });
    this.spInstance.on('connect', () => {
      this.setStatus(PeerConnectionState.Connected);
      // this.localPeer?.streamTracks(this);
      this.sendDataToPeer({
        kind: DataPacketMuteStatus,
        value: { data: this.localPeer?.isMuted },
      });
    });
    this.spInstance.on('close', () => {
      this.setStatus(PeerConnectionState.Closed);
    });
    this.spInstance.on('error', (err) => {
      console.error('RemotePeer error:', err);
      this.setStatus(PeerConnectionState.Failed);
    });
    this.spInstance.on('signal', (data: SimplePeer.SignalData) => {
      this.sendSignal(data);
      if (this.status !== PeerConnectionState.Connected) {
        this.setStatus(PeerConnectionState.Connecting);
      }
    });
    this.spInstance.on('stream', (stream: MediaStream) => {
      console.log('RemotePeer: got stream');
      if (stream.getAudioTracks().length > 0) {
        this.audioStream = stream;
        const track = stream.getAudioTracks()[0];
        this.audioTracks.set(track.id, track);
        this.analysers[0] = PeerSpeakingDetectionAnalyser.initialize(this);
        let audioElement: HTMLMediaElement = this.getMediaElement(
          TrackKind.Audio
        );
        document.body.appendChild(audioElement);
        audioElement.srcObject = stream;
        audioElement.play();
        this.setters.setAudioAttached(true);
      }
      this.setStatus(PeerConnectionState.Connected);
    });
    // this.spInstance.on(
    //   'track',
    //   (track: MediaStreamTrack, stream: MediaStream) => {
    //     // console.log('_onTrack track added', track.id, track, stream);
    //     // this.setStatus(PeerConnectionState.Connected);
    //     // if (track.kind === 'audio') {
    //     //   if (this.audioTracks.size > 0) {
    //     //     console.log('this.audioTracks.size > 0, rmeoving tracks', track.id);
    //     //     this.removeTracks();
    //     //   }
    //     //   this.audioTracks.set(track.id, track);
    //     //   this.audioStream = stream;
    //     //   this.analysers[0] = PeerSpeakingDetectionAnalyser.initialize(this);
    //     //   this.attach(track);
    //     //   this.setters.setAudioAttached(true);
    //     // }
    //   }
    // );
    this.spInstance.on('data', (data) => {
      const dataPacket = JSON.parse(data.toString()) as DataPacket;
      if (dataPacket.kind === DataPacketMuteStatus) {
        const payload = dataPacket.value as DataPayload;
        if (payload.data) {
          this.mute();
        } else {
          this.unmute();
        }
      } else if (dataPacket.kind === DataPacketSpeakingChanged) {
        const payload = dataPacket.value as DataPayload;
        this.isSpeakingChanged(payload.data);
      } else {
        this.setters.onDataChannel(dataPacket);
      }
    });
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

  dial(options?: ConnectionSetupOptions) {
    this.setStatus(PeerConnectionState.New);
    // only the waiting peer sends the waiting signal
    if (!this.isInitiator) {
      this.createConnection(options);
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

  removeTracks() {
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.stop();
      this.detach(track);
    });
    this.audioTracks.clear();
    this.setters.setAudioAttached(false);
  }

  mute() {
    this.isMuted = true;
    this.setters.setMuted(true);
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.enabled = false;
    });
  }

  unmute() {
    this.isMuted = false;
    this.setters.setMuted(false);
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.enabled = true;
    });
  }

  isSpeakingChanged(speaking: boolean) {
    this.isSpeaking = speaking;
    this.setters.setSpeaking(speaking);
  }

  setStatus(status: PeerConnectionState) {
    this.status = status;
    this.setters.setStatus(status);
  }

  hangup() {
    this.removeTracks();
    this.spInstance?.destroy();
  }

  // attach(track: MediaStreamTrack): HTMLMediaElement {
  //   let element: HTMLMediaElement = this.getMediaElement(
  //     track.kind as TrackKind
  //   );
  //   element = attachToElement(track, element);
  //   console.log(element);
  //   if (element instanceof HTMLAudioElement) {
  //     this.isAudioAttached = true;
  //     // element
  //     //   .play()
  //     //   .then(() => {
  //     //     console.log('playing audio from peer', this.patp);
  //     //   })
  //     //   .catch((e) => {
  //     //     console.error('ERROR: playing audio from peer', this.patp, e);
  //     //   });
  //   } else if (element instanceof HTMLVideoElement) {
  //     this.isVideoAttached = true;
  //   }
  //   document.body.appendChild(element);
  //   // console.log('attached', element);
  //   return element;
  // }

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
    if (element instanceof HTMLAudioElement) {
      element.pause();
    }
    if (element) {
      detachTrack(track, element);
    }
    document.body.removeChild(element);
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
  // if (element instanceof HTMLVideoElement) {
  //   element.playsInline = true;
  // }
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
