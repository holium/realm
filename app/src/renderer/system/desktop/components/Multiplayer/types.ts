import { ShipModelType } from 'renderer/logic/ship/store';
import { Vec2 } from '../Cursor';
import { SendPartial } from './multiplayer';

export enum RealmEvent {
  Join = 'join',
  UpdatePresenceState = 'update-presence-state',
  SyncPresenceState = 'sync-presence-state',
}

export interface BaseRealmPayload {
  event: string;
  id: string; // ID of the current app session
}

export interface JoinPayload extends BaseRealmPayload {
  event: RealmEvent.Join;
}

export interface PresenceStatePayload extends BaseRealmPayload {
  event: RealmEvent.UpdatePresenceState;
  key: string;
  value: any;
}

export interface PresenceStateSyncPayload extends BaseRealmPayload {
  event: RealmEvent.SyncPresenceState;
  state: Record<string, any>;
}

export enum CursorEvent {
  Move = 'cursor-move',
  Over = 'cursor-over',
  Down = 'cursor-down',
  Up = 'cursor-up',
  Out = 'cursor-out',
  Click = 'cursor-click',
  Leave = 'cursor-leave',
}
export interface BaseCursorPayload extends BaseRealmPayload {
  event: CursorEvent;
}

export interface CursorMovePayload extends BaseCursorPayload {
  event: CursorEvent.Move;
  position: Vec2;
}

export interface CursorOverPayload extends BaseCursorPayload {
  event: CursorEvent.Over;
  target: string; // unique data-multi-click id
}

export interface CursorDownPayload extends BaseCursorPayload {
  event: CursorEvent.Down;
  target: string; // unique data-multi-click id
}

export interface CursorUpPayload extends BaseCursorPayload {
  event: CursorEvent.Up;
  target: string; // unique data-multi-click id
}

export interface CursorClickPayload extends BaseCursorPayload {
  event: CursorEvent.Click;
  target: string; // unique data-multi-click id
}

export interface CursorOutPayload extends BaseCursorPayload {
  event: CursorEvent.Out;
  target: string; // unique data-multi-click id
}

export interface CursorLeavePayload extends BaseCursorPayload {
  event: CursorEvent.Leave;
}

export type AnyPayload =
  | JoinPayload
  | CursorMovePayload
  | CursorClickPayload
  | CursorLeavePayload
  | CursorOverPayload
  | CursorDownPayload
  | CursorUpPayload
  | CursorOutPayload
  | PresenceStatePayload
  | PresenceStateSyncPayload;

export interface RealmMultiplayerInterface {
  init: ({ roomId, ship }: { roomId: string; ship: ShipModelType }) => void;
  join: (roomId: string) => void;
  leave: (roomId: string) => void;
  send: <T extends SendPartial<BaseRealmPayload>>(payload: T) => void;
  getPresenceState: (key: string) => Record<string, any>;
  subscribe: <T extends BaseRealmPayload>(
    event: string,
    handler: (payload: T) => void
  ) => () => void;
  close: typeof close;
}

declare global {
  var ship: ShipModelType;
  var id: string;
}
