import { EventEmitter } from 'events';
import { action, makeObservable, observable, runInAction } from 'mobx';
import TypedEmitter from 'typed-emitter';
import { patp2dec } from 'urbit-ob';

import { Patp } from '../types';
import { PeerEvent } from './events';
import { PeerConnectionState } from './types';

export interface PeerConfig {
  isHost: boolean;
  rtc: RTCConfiguration;
}
export abstract class Peer extends (EventEmitter as new () => TypedEmitter<PeerEventCallbacks>) {
  patp: Patp;
  patpId: number;
  host: boolean; // is this peer the host of the room
  audioLevel: number = 0;
  isMuted: boolean = false;
  isSpeaking: boolean = false;
  tracks: Map<string, any>;
  audioTracks: Map<string, any>;
  videoTracks: Map<string, any>;
  lastSpokeAt: Date | null = null;
  status: PeerConnectionState = PeerConnectionState.New;

  constructor(patp: Patp, config: PeerConfig) {
    super();
    this.patp = patp;
    console.log('patp', patp);
    console.log('patp2dec', patp2dec('~zod'));
    console.log('patp2dec', patp2dec('~dopmer-fopryg-novned-tidsyl'));
    console.log('patp2dec', patp2dec('~novned-tidsyl'));
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
      status: observable,
      mute: action.bound,
      unmute: action.bound,
      setHost: action.bound,
      setAudioLevel: action.bound,
    });
  }

  get hasAudio() {
    return this.audioTracks.size > 0;
  }

  get hasVideo() {
    return this.videoTracks.size > 0;
  }

  setHost(isHost: boolean) {
    this.host = isHost;
  }

  setAudioLevel(audioLevel: number) {
    this.audioLevel = audioLevel;
  }

  mute() {
    this.isMuted = true;
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.enabled = false;
    });
    this.emit(PeerEvent.Muted);
  }

  unmute() {
    this.isMuted = false;
    this.audioTracks.forEach((track: MediaStreamTrack) => {
      track.enabled = true;
    });
    this.emit(PeerEvent.Unmuted);
  }

  isSpeakingChanged(speaking: boolean) {
    runInAction(() => {
      this.isSpeaking = speaking;
      this.emit(PeerEvent.IsSpeakingChanged, speaking);
    });
  }
}

export type PeerEventCallbacks = {
  connected: () => void;
  disconnected: (reason?: any) => void;
  failed: (err: Error) => void;
  closed: () => void;
  dialing: () => void;
  redialing: () => void;
  deviceSourceChanged: (deviceId: string) => void;
  mediaStreamAdded: (stream: MediaStream) => void;
  mediaStreamRemoved: (stream: MediaStream) => void;
  audioTrackAdded: (stream: MediaStream, track: MediaStreamTrack) => void;
  audioTrackRemoved: (track: MediaStreamTrack) => void;
  videoTrackAdded: (stream: MediaStream, track: MediaStreamTrack) => void;
  videoTrackRemoved: (track: MediaStreamTrack) => void;
  audioPlaybackStarted: () => void;
  audioPlaybackStopped: () => void;
  audioPlaybackFailed: (err: Error) => void;
  receivedData: (data: any) => void;
  isSpeakingChanged: (speaking: boolean) => void;
  muted: () => void;
  unmuted: () => void;
};
