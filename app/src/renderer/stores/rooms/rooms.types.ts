import { MultiplayerPayload, PresenceBroadcast } from '@holium/realm-presence';

export enum DataPacket_Kind {
  DATA = 0,
  CURSOR = 1,
  TRACK_META = 2,
  MUTE_STATUS = 3,
  SPEAKING_CHANGED = 4,
  CHAT = 5,
  TYPING_STATUS = 6,
  UNRECOGNIZED = -1,
}

export enum DataPacketKind {
  DATA = 0,
  CURSOR = 1,
  TRACK_META = 2,
  MUTE_STATUS = 3,
  SPEAKING_CHANGED = 4,
  UNRECOGNIZED = -1,
}
export interface DataPayload {
  app?: string;
  data?: any;
}

export enum PeerEvent {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Failed = 'failed',
  New = 'new',
  Closed = 'closed',
  Dialing = 'dialing',
  Redialing = 'redialing',
  MediaStreamAdded = 'mediaStreamAdded',
  MediaStreamRemoved = 'mediaStreamRemoved',
  AudioTrackAdded = 'audioTrackAdded',
  AudioTrackRemoved = 'audioTrackRemoved',
  VideoTrackAdded = 'videoTrackAdded',
  VideoTrackRemoved = 'videoTrackRemoved',
  AudioPlaybackStarted = 'audioPlaybackStarted',
  AudioPlaybackStopped = 'audioPlaybackStopped',
  AudioPlaybackFailed = 'audioPlaybackFailed',
  IsSpeakingChanged = 'isSpeakingChanged',
  ReceivedData = 'receivedData',
  Muted = 'muted',
  Unmuted = 'unmuted',
  DeviceSourceChanged = 'deviceSourceChanged',
}

export enum ConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
}

export enum ConnectionQuality {
  Excellent = 'excellent',
  Good = 'good',
  Poor = 'poor',
  Unknown = 'unknown',
}

export enum PeerConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Failed = 'failed',
  New = 'new',
  Closed = 'closed',
  Destroyed = 'destroyed',
  Redialing = 'redialing',
  Broadcasting = 'broadcasting',
}
export interface DataPacket {
  from: string;
  kind: DataPacketKind;
  value: {
    multiplayer?: MultiplayerPayload;
    broadcast?: PresenceBroadcast;
  } & DataPayload;
}
export enum TrackKind {
  Audio = 'audio',
  Video = 'video',
  Unknown = 'unknown',
}
declare global {
  interface Window {
    webkitAudioContext: () => AudioContext;
    cancelAnimationFrame: (frameId: number) => undefined;
  }
}
