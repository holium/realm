export type Patp = string;

export type SlipType = {
  from: Patp;
  data: any;
};

export type EnterDiff = { enter: Patp };
export type ExitDiff = { exit: Patp };
export type DiffType = EnterDiff | ExitDiff;

export type RoomsModelType = {
  id: string;
  provider: string;
  creator: string;
  access: string;
  title: string;
  present: string[];
  whitelist: string[];
  capacity: number;
  space: string;
  cursors: boolean;
};

export enum PeerConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Failed = 'failed',
  New = 'new',
  Closed = 'closed',
}

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
