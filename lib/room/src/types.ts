export type Patp = string;

export interface SlipType {
  from: Patp;
  data: any;
}

export interface EnterDiff {
  enter: Patp;
}
export interface ExitDiff {
  exit: Patp;
}
export type DiffType = EnterDiff | ExitDiff;

export interface RoomType {
  rid: string;
  provider: string;
  creator: string;
  access: string;
  title: string;
  present: string[];
  whitelist: string[];
  capacity: number;
  path: string | null;
}

export type RoomMap = Map<string, RoomType>;

export enum RoomState {
  Starting = 'starting',
  Started = 'started',
  Ended = 'ended',
  Left = 'left',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Added = 'added',
  Kicked = 'kicked',
}
