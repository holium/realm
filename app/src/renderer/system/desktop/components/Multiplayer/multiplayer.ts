// Functions that manage multiplayer

import { ShipModelType } from 'renderer/logic/ship/store';
import { RealmMultiplayerInterface, AnyPayload } from './types';

let socket: WebSocket | undefined;

const subscriptions: Record<string, Set<Function>> = {};
let ship: ShipModelType | undefined;

// initialize websocket connection, join an initial room, and set up subscriptions dispatch
export const init: RealmMultiplayerInterface['init'] = ({
  roomId,
  ship: initShip,
}) => {
  tryInit();

  // ship is loaded into webview via ipc + contextBridge, separately from preload
  // so we need to wait for it to be loaded
  function tryInit() {
    ship = initShip ? JSON.parse(JSON.stringify(initShip)) : globalThis.ship;
    if (!ship) {
      console.error('no ship info, trying again in 100ms');
      setTimeout(() => {
        tryInit();
      }, 100);
    } else {
      _init();
    }
  }

  function _init() {
    socket = new WebSocket('ws://localhost:3001/ws');
    socket.addEventListener('open', () => {
      join(roomId);
    });
    socket.addEventListener('message', (e) => {
      try {
        const payload: AnyPayload = JSON.parse(e.data);
        subscriptions[payload.event]?.forEach((handler) => handler(payload));
      } catch (error) {
        console.error('Could not parse message from websockets', e, error);
      }
    });
  }
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
  if (socket?.readyState !== WebSocket.OPEN || !ship) return;
  socket.send(
    JSON.stringify({
      ...payload,
      id: getSessionID(),
      // TODO: factor this out into presence state per socket
      color: ship.color,
      nickname: ship.nickname,
      patp: ship.patp,
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
  if (!ship) throw new Error('ship not loaded');
  return globalThis.id + ship.patp;
}
