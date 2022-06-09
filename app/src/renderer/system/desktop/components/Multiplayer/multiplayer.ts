// Functions that manage multiplayer

import { RealmMultiplayerInterface, AnyPayload } from './types';

let socket: WebSocket | undefined;

const subscriptions: Record<string, Set<Function>> = {};

// initialize websocket connection, join an initial room, and set up subscriptions dispatch
export const init: RealmMultiplayerInterface['init'] = (roomId) => {
  socket = new WebSocket('ws://localhost:3001/ws');
  socket.addEventListener('open', () => {
    join(roomId);
  });
  socket.addEventListener('message', (e) => {
    try {
      const payload: AnyPayload = JSON.parse(e.data);
      subscriptions[payload.event]?.forEach((handler) => handler(payload));
      console.log('received payload', payload);
    } catch (error) {
      console.error('Could not parse message from websockets', e, error);
    }
  });
};

export const close: RealmMultiplayerInterface['close'] = () => {
  socket?.close();
};

export const join: RealmMultiplayerInterface['join'] = (roomId) => {
  socket?.send(
    JSON.stringify({
      event: 'join',
      roomId,
    })
  );
};

export type SendPartial<T> = Omit<T, 'id' | 'color' | 'nickname' | 'patp'>;

export const send: RealmMultiplayerInterface['send'] = (payload) => {
  if (socket?.readyState !== WebSocket.OPEN) return;
  socket.send(
    JSON.stringify({
      ...payload,
      id: getSessionID(),
      // TODO: factor this out into presence state per socket
      color: window.ship.color,
      nickname: window.ship.nickname,
      patp: window.ship.patp,
    })
  );
};

export const subscribe: RealmMultiplayerInterface['subscribe'] = (
  event,
  handler
) => {
  // add handler to subscription handlers for event
  subscriptions[event] = subscriptions[event] || new Set();
  subscriptions[event].add(handler);
  // returns an unsubscribe function
  return () => {
    subscriptions[event].delete(handler);
  };
};

export const leave: RealmMultiplayerInterface['leave'] = (roomId) => {
  socket?.send(
    JSON.stringify({
      event: 'join',
      roomId,
    })
  );
};

// Create bindings to globalThis to manage multiplayer through websockets
export const api: RealmMultiplayerInterface = {
  init,
  join,
  leave,
  send,
  subscribe,
  close,
};

function getSessionID() {
  return globalThis.id + globalThis.ship.patp;
}
