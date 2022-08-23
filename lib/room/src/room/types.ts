import { Patp } from 'types';

export enum TrackType {
  AUDIO = 0,
  VIDEO = 1,
  DATA = 2,
  UNRECOGNIZED = -1,
}

export enum TrackSource {
  UNKNOWN = 0,
  CAMERA = 1,
  MICROPHONE = 2,
  SCREEN_SHARE = 3,
  SCREEN_SHARE_AUDIO = 4,
  UNRECOGNIZED = -1,
}

export enum ConnectionQuality {
  POOR = 0,
  GOOD = 1,
  EXCELLENT = 2,
  UNRECOGNIZED = -1,
}

export enum DisconnectReason {
  UNKNOWN_REASON = 0,
  CLIENT_INITIATED = 1,
  DUPLICATE_IDENTITY = 2,
  SERVER_SHUTDOWN = 3,
  PARTICIPANT_REMOVED = 4,
  ROOM_DELETED = 5,
  STATE_MISMATCH = 6,
  JOIN_FAILURE = 7,
  UNRECOGNIZED = -1,
}

export interface Room {
  rid: string;
  name: string;
  emptyTimeout: number;
  maxParticipants: number;
  creationTime: number;
  enabledCodecs: Codec[];
  metadata: string;
  numParticipants: number;
}

export enum ParticipantInfo_State {
  /** JOINING - websocket' connected, but not offered yet */
  JOINING = 0,
  /** JOINED - server received client offer */
  JOINED = 1,
  /** ACTIVE - ICE connectivity established */
  ACTIVE = 2,
  /** DISCONNECTED - WS disconnected */
  DISCONNECTED = 3,
  UNRECOGNIZED = -1,
}

export interface ParticipantInfo {
  rid: string;
  patp: Patp;
  state: ParticipantInfo_State;
  tracks: any[];
  metadata: string;
  /** timestamp when participant joined room, in seconds */
  joinedAt: number;
  name: string;
  version: number;
  region: string;
  /**
   * indicates the participant has an active publisher connection
   * and can publish to the server
   */
  isPublisher: boolean;
}

export interface Codec {
  mime: string;
  fmtpLine: string;
}

export interface ActiveSpeakerUpdate {
  speakers: SpeakerInfo[];
}

export interface SpeakerInfo {
  rid: string;
  /** audio level, 0-1.0, 1 is loudest */
  level: number;
  /** true if speaker is currently active */
  active: boolean;
}

export enum RoomState {
  Starting = 'starting',
  Started = 'started',
  Ended = 'ended',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Added = 'added',
  Kicked = 'kicked',
}
