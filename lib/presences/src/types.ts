type Position = { x: number; y: number };

export type MouseState = 'text' | 'resize' | 'pointer';

type MultiplayerEvent =
  | 'mouse-move'
  | 'mouse-down'
  | 'mouse-up'
  | 'mouse-click'
  | 'mouse-over'
  | 'mouse-out';

type PresenceEvent = 'transaction' | 'broadcast' | 'chat';

interface MultiplayerPayloadBase {
  patp: string;
  event: MultiplayerEvent;
}

interface PresencePayloadBase {
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
  patp: string;
  version: number;
  steps: any;
  clientID: string | number;
  event: 'transaction';
}

export interface PresenceBroadcast extends PresencePayloadBase {
  event: 'broadcast';
  data: any;
}

export interface PresenceChat extends PresencePayloadBase {
  patp: string;
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
  | PresenceBroadcast
  | PresenceChat;