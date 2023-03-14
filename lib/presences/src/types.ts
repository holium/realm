type Position = { x: number; y: number };

export type MouseState = 'text' | 'resize' | 'pointer';

type MultiplayerEvent =
  | 'mouse-move'
  | 'mouse-down'
  | 'mouse-up'
  | 'mouse-click'
  | 'mouse-over'
  | 'mouse-out';

type PresenceEvent = 'transaction' | 'caret' | 'chat';

interface MultiplayerPayloadBase {
  patp: string;
  event: MultiplayerEvent;
}

interface PresencePayloadBase {
  patp: string;
  event: PresenceEvent;
}

export interface MultiplayerMove extends MultiplayerPayloadBase {
  event: 'mouse-move';
  position: Position;
  state: MouseState;
  hexColor: string;
}

export interface MultiplayerDown extends MultiplayerPayloadBase {
  event: 'mouse-down';
}

export interface MultiplayerUp extends MultiplayerPayloadBase {
  event: 'mouse-up';
}

export interface MultiplayerClick extends MultiplayerPayloadBase {
  event: 'mouse-click';
  elementId: string;
}

export interface MultiplayerOut extends MultiplayerPayloadBase {
  event: 'mouse-out';
}

export interface PresenceTransaction extends PresencePayloadBase {
  version: number;
  steps: any;
  clientID: string | number;
  event: 'transaction';
}

export interface PresenceCaret extends PresencePayloadBase {
  event: 'caret';
  position: Position;
}

export interface PresenceChat extends PresencePayloadBase {
  event: 'chat';
  message: string;
}

export type MultiplayerPayload =
  | MultiplayerMove
  | MultiplayerDown
  | MultiplayerUp
  | MultiplayerClick
  | MultiplayerOut;

export type PresencePayload =
  | PresenceTransaction
  | PresenceCaret
  | PresenceChat;
