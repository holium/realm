import {
  CaretPayload,
  ChatPayload,
  CursorPayload,
  TransactionPayload,
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

export interface TrackMetaPayload {
  peer: Patp;
  isMuted: boolean;
  isCursorSharing: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  audioLevel: number; // 0 - 10
  lastSpokeAt: number; // unix timestamp
}

export interface DataPacket {
  from: Patp;
  kind: DataPacket_Kind;
  value: {
    cursor?: CursorPayload;
    trackMeta?: TrackMetaPayload;
    transaction?: TransactionPayload;
    caret?: CaretPayload;
    chat?: ChatPayload;
  } & DataPayload;
}
