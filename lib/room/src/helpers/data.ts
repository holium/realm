import { MultiplayerPayload, PresenceBroadcast } from '@holium/realm-presence';
import { Patp } from '../types';

export enum DataPacket_Kind {
  DATA = 0,
  CURSOR = 1,
  TRACK_META = 2,
  MUTE_STATUS = 3,
  SPEAKING_CHANGED = 4,
  CHAT = 5,
  TYPING = 6,
  CALL = 7,
  UNRECOGNIZED = -1,
}

export interface DataPayload {
  app?: string;
  data?: any;
}

export interface DataPacket {
  from: Patp;
  rid: string;
  kind: DataPacket_Kind;
  value: {
    multiplayer?: MultiplayerPayload;
    broadcast?: PresenceBroadcast;
  } & DataPayload;
}
