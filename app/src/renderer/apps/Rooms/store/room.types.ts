import { MultiplayerPayload, PresenceBroadcast } from '@holium/realm-presence';

export enum DataPacket_Kind {
  DATA = 0,
  CURSOR = 1,
  TRACK_META = 2,
  MUTE_STATUS = 3,
  SPEAKING_CHANGED = 4,
  SCREENSHARE_CHANGED = 5,
  WEBCAM_CHANGED = 6,
  UNRECOGNIZED = -1,
}

export enum DataPacketKind {
  DATA = 0,
  CURSOR = 1,
  TRACK_META = 2,
  MUTE_STATUS = 3,
  SPEAKING_CHANGED = 4,
  SCREENSHARE_CHANGED = 5,
  WEBCAM_CHANGED = 6,
  UNRECOGNIZED = -1,
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
  // path which is specific to its application (e.g. room, chat, notes, etc...)
  //  used to distinguish and properly route packets to remotes
  path: string;
  value: {
    multiplayer?: MultiplayerPayload;
    broadcast?: PresenceBroadcast;
    data?: boolean; // Used to toggle screen/cam/mic in Rooms.
  };
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
