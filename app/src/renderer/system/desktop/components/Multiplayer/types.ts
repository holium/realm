import { ShipModelType } from 'renderer/logic/ship/store';
import { Vec2 } from '../Cursor';
import { SendPartial } from './multiplayer';
export interface JoinPayload {
  event: 'join';
  id: string; // ID of the current app session
}

export enum CursorEvent {
  Move = 'mousemove',
  Click = 'click',
}

export interface BaseCursorPayload
  extends Pick<ShipModelType, 'color' | 'nickname' | 'patp'> {
  event: CursorEvent;
  id: string; // ID of the current app session
}

export interface CursorMovePayload extends BaseCursorPayload {
  event: CursorEvent.Move;
  position: Vec2;
}

export interface CursorClickPayload extends BaseCursorPayload {
  event: CursorEvent.Click;
  target: string; // some UUID on a button
}

export type AnyPayload = JoinPayload | CursorMovePayload | CursorClickPayload;

export interface RealmMultiplayerInterface {
  init: (roomId: string) => void;
  join: (roomId: string) => void;
  leave: (roomId: string) => void;
  send: (payload: SendPartial<AnyPayload>) => void;
  subscribe: <T extends AnyPayload>(
    event: string,
    handler: (payload: T) => void
  ) => () => void;
  close: typeof close;
}

declare global {
  var ship: ShipModelType;
  var id: string;
}
