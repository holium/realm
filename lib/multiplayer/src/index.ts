import {
  RealmMultiplayerProvider as Provider,
  RealmMultiplayerContext as Context,
} from './Provider';
import { Clickable } from './Clickable';
import { useChannel, useShips } from './hooks';

import { RealmMultiplayerInterface } from './types';

declare global {
  var realmMultiplayer: RealmMultiplayerInterface | undefined;
}

export { Context, Provider, Clickable, useShips, useChannel };
export type {
  Vec2,
  SendPartial,
  MultiplayerShipType,
  BaseRealmPayload,
  JoinPayload,
  PresenceStatePayload,
  PresenceStateSyncPayload,
  BaseCursorPayload,
  CursorMovePayload,
  CursorOverPayload,
  CursorDownPayload,
  CursorUpPayload,
  CursorClickPayload,
  CursorOutPayload,
  CursorLeavePayload,
  AnyPayload,
  RealmMultiplayerInterface,
  Ship,
  CursorPayload,
  StatePayload,
} from './types';

export { CursorEvent, RealmEvent } from './types';
