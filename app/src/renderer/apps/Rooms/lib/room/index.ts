/**
 * Room
 *
 * A room is a list of participants,
 * participants can stream various track types to the rooms participants.
 */

import { EventEmitter } from 'events';
import { Patp } from 'os/types';
import type TypedEmitter from 'typed-emitter';
import { ConnectionState, RoomEventCallbacks } from './types';

export class Room extends (EventEmitter as new () => TypedEmitter<RoomEventCallbacks>) {
  state: ConnectionState = ConnectionState.Disconnected;
  participants: Map<Patp, RemoteParticipant>;

  constructor() {
    super();
    this.participants = new Map();
  }
}
