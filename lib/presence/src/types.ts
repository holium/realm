type Position = { x: number; y: number };

export type MouseState = 'text' | 'resize' | 'pointer';

interface BaseRealmPayload {
  event: string;
  id: string; // ID of the current app session
}

export enum CursorEvent {
  Move = 'cursor-move',
  Down = 'cursor-down',
  Up = 'cursor-up',
  Over = 'cursor-over',
  Out = 'cursor-out',
}

interface BaseCursorPayload extends BaseRealmPayload {
  event: CursorEvent;
}

export interface CursorMovePayload extends BaseCursorPayload {
  event: CursorEvent.Move;
  position: Position;
  state: MouseState;
  hexColor: string;
}

export interface CursorDownPayload extends BaseCursorPayload {
  event: CursorEvent.Down;
  position: Position;
}

export interface CursorUpPayload extends BaseCursorPayload {
  event: CursorEvent.Up;
}

export interface CursorOutPayload extends BaseCursorPayload {
  event: CursorEvent.Out;
}

export type CursorPayload =
  | BaseRealmPayload
  | CursorMovePayload
  | CursorDownPayload
  | CursorUpPayload
  | CursorOutPayload;
