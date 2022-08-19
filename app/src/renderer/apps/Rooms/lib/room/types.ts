import { Patp } from 'os/types';

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

export enum ConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
}

export type RoomEventCallbacks = {
  reconnecting: () => void;
  reconnected: () => void;
  disconnected: (reason?: DisconnectReason) => void;
  connectionStateChanged: (state: ConnectionState) => void;
  mediaDevicesChanged: () => void;

  /** @deprecated stateChanged has been renamed to connectionStateChanged */
  // stateChanged: (state: ConnectionState) => void;
  // connectionStateChanged: (state: ConnectionState) => void;
  // participantConnected: (participant: RemoteParticipant) => void;
  // participantDisconnected: (participant: RemoteParticipant) => void;
  // trackPublished: (
  //   publication: RemoteTrackPublication,
  //   participant: RemoteParticipant
  // ) => void;
  // trackSubscribed: (
  //   track: RemoteTrack,
  //   publication: RemoteTrackPublication,
  //   participant: RemoteParticipant
  // ) => void;
  // trackSubscriptionFailed: (
  //   trackSid: string,
  //   participant: RemoteParticipant
  // ) => void;
  // trackUnpublished: (
  //   publication: RemoteTrackPublication,
  //   participant: RemoteParticipant
  // ) => void;
  // trackUnsubscribed: (
  //   track: RemoteTrack,
  //   publication: RemoteTrackPublication,
  //   participant: RemoteParticipant
  // ) => void;
  // trackMuted: (publication: TrackPublication, participant: Participant) => void;
  // trackUnmuted: (
  //   publication: TrackPublication,
  //   participant: Participant
  // ) => void;
  // localTrackPublished: (
  //   publication: LocalTrackPublication,
  //   participant: LocalParticipant
  // ) => void;
  // localTrackUnpublished: (
  //   publication: LocalTrackPublication,
  //   participant: LocalParticipant
  // ) => void;
  // participantMetadataChanged: (
  //   metadata: string | undefined,
  //   participant: RemoteParticipant | LocalParticipant
  // ) => void;
  // participantPermissionsChanged: (
  //   prevPermissions: ParticipantPermission,
  //   participant: RemoteParticipant | LocalParticipant
  // ) => void;
  // activeSpeakersChanged: (speakers: Array<Participant>) => void;
  // roomMetadataChanged: (metadata: string) => void;
  // dataReceived: (
  //   payload: Uint8Array,
  //   participant?: RemoteParticipant,
  //   kind?: DataPacket_Kind
  // ) => void;
  // connectionQualityChanged: (
  //   quality: ConnectionQuality,
  //   participant: Participant
  // ) => void;
  // mediaDevicesError: (error: Error) => void;
  // trackStreamStateChanged: (
  //   publication: RemoteTrackPublication,
  //   streamState: Track.StreamState,
  //   participant: RemoteParticipant
  // ) => void;
  // trackSubscriptionPermissionChanged: (
  //   publication: RemoteTrackPublication,
  //   status: TrackPublication.SubscriptionStatus,
  //   participant: RemoteParticipant
  // ) => void;
  // audioPlaybackChanged: (playing: boolean) => void;
  // signalConnected: () => void;
};
