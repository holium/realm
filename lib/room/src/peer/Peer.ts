import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { patp2dec } from 'urbit-ob';
import { Patp, PeerConnectionState } from '../types';
import SimplePeer from 'simple-peer';
import { action, makeObservable, observable } from 'mobx';
import { BaseProtocol } from '../connection/BaseProtocol';

const PeerConnectionConfig = {
  iceServers: [{ urls: ['stun:coturn.holium.live:3478'] }],
};

export type PeerConfig = {
  isHost: boolean;
  rtc: RTCConfiguration;
};
export abstract class Peer extends (EventEmitter as new () => TypedEmitter<PeerEventCallbacks>) {
  patp: Patp;
  patpId: number;
  host: boolean; // is this peer the host of the room
  audioLevel: number = 0;
  isMuted: boolean = false;
  isSpeaking: boolean = false;
  tracks: Map<string, any>;
  // peerConn: RTCPeerConnection;
  // peer?: SimplePeer.Instance;
  // private audioRef!: HTMLAudioElement;
  // private dataChannel!: RTCDataChannel;
  audioTracks: Map<string, any>;
  videoTracks: Map<string, any>;
  lastSpokeAt?: Date | undefined;
  status: PeerConnectionState = PeerConnectionState.Disconnected;

  constructor(patp: Patp, config: PeerConfig) {
    super();
    this.patp = patp;
    this.patpId = patp2dec(patp);
    this.host = config.isHost;
    this.audioTracks = new Map();
    this.videoTracks = new Map();
    this.tracks = new Map();

    makeObservable(this, {
      isMuted: observable,
      isSpeaking: observable,
      audioLevel: observable,
      lastSpokeAt: observable,
      mute: action.bound,
      unmute: action.bound,
      setHost: action.bound,
      setAudioLevel: action.bound,
    });
  }

  setHost(isHost: boolean) {
    this.host = isHost;
  }

  setAudioLevel(audioLevel: number) {
    this.audioLevel = audioLevel;
  }

  mute() {
    this.isMuted = true;
  }

  unmute() {
    this.isMuted = false;
  }
}

export type PeerEventCallbacks = {
  connected: () => void;
  disconnected: (reason?: any) => void;
  failed: () => void;
  new: () => void;
  closed: () => void;
  dialing: () => void;
  redialing: () => void;
  // audioStreamAdded: (stream: MediaStream) => void;
  // audioStreamRemoved: (stream: MediaStream) => void;
  // isSpeakingChanged: (speaking: boolean) => void;
};
