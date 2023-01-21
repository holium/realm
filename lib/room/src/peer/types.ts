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
  Broadcasting = 'broadcasting',
}

export enum TrackKind {
  Audio = 'audio',
  Video = 'video',
  Unknown = 'unknown',
}
