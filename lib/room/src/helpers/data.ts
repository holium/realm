import {
  PresenceChat,
  MultiplayerPayload,
  PresenceTransaction,
  PresenceBroadcast,
} from '@holium/realm-presence';
import { Patp } from '../types';

export enum DataPacket_Kind {
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

export interface DataPacket {
  from: Patp;
  kind: DataPacket_Kind;
  value: {
    cursor?: MultiplayerPayload;
    transaction?: PresenceTransaction;
    broadcast?: PresenceBroadcast;
    chat?: PresenceChat;
  } & DataPayload;
}
