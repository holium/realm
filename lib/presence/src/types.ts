type Position = { x: number; y: number };

export type MouseState = 'text' | 'resize' | 'pointer';

interface BaseRealmPayload {
  patp: string;
  event: string;
}

export enum CursorEvent {
  Move = 'cursor-move',
  Down = 'cursor-down',
  Up = 'cursor-up',
  Click = 'cursor-click',
  Over = 'cursor-over',
  Out = 'cursor-out',
  Transaction = 'transaction',
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
}

export interface CursorUpPayload extends BaseCursorPayload {
  event: CursorEvent.Up;
}

export interface CursorClickPayload extends BaseCursorPayload {
  event: CursorEvent.Click;
  elementId: string;
}

export interface CursorOutPayload extends BaseCursorPayload {
  event: CursorEvent.Out;
}

export interface TransactionPayload extends BaseCursorPayload {
  version: number;
  steps: any;
  clientID: string | number;
  event: CursorEvent.Transaction;
}

export type CursorPayload =
  | BaseRealmPayload
  | CursorMovePayload
  | CursorDownPayload
  | CursorUpPayload
  | CursorOutPayload;
