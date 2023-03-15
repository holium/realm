// Functions that manage multiplayer

import {
  RealmMultiplayerInterface,
  AnyPayload,
  PresenceStatePayload,
  RealmEvent,
  PresenceStateSyncPayload,
  MultiplayerShipType,
} from '@holium/realm-presence';

let socket: WebSocket | undefined;

// Tracks subscription handlers for each event key to dispatch to
type EventKey = string;
const subscriptions: Record<EventKey, Set<Function>> = {};
// Tracks presence states that the developer stores, which are distributed to each client
type PresenceStateKey = string;
type SessionId = string;
const presenceStates: Record<PresenceStateKey, Record<SessionId, object>> = {};
let ship: MultiplayerShipType | undefined;

// initialize websocket connection, join an initial room, and set up subscriptions dispatch
export const init: RealmMultiplayerInterface['init'] = ({
  roomId,
  ship: initShip,
}) => {
  tryInit();

  // ship is loaded into webview via ipc + contextBridge, separately from preload
  // so we need to wait for it to be loaded
  function tryInit() {
    // @ts-ignore
    ship = initShip ? JSON.parse(JSON.stringify(initShip)) : globalThis.ship;
    if (!ship) {
      console.error('no ship info, trying again in 10ms');
      setTimeout(() => {
        tryInit();
      }, 10);
    } else {
      _init();
    }
  }

  function _init() {
    socket = new WebSocket('ws://localhost:3001/ws');
    socket.addEventListener('open', () => {
      join(roomId);
      // Special presence state we provide everyone: ship info
      const shipPresenceState: PresenceStatePayload = {
        event: RealmEvent.UpdatePresenceState,
        id: getSessionID(),
        key: 'ship',
        value: ship,
      };
      // update in local scope
      updatePresenceState(shipPresenceState);
      // send to others
      socket?.send(JSON.stringify(shipPresenceState));
      // fake presence state update for self to trigger subscribe handler
      subscriptions[RealmEvent.UpdatePresenceState]?.forEach((handler) =>
        handler(shipPresenceState)
      );
    });
    socket.addEventListener('message', (e) => {
      try {
        const payload: AnyPayload = JSON.parse(e.data);
        if (payload.event === RealmEvent.UpdatePresenceState) {
          updatePresenceState(payload);
        }
        // someone else has joined, sync over our presence state
        if (payload.event === RealmEvent.Join) {
          // TODO: currently everyone will sync over their states
          // we should only have one person sync over
          console.log('syncing state over to new client that joined');
          const fullSyncPayload: PresenceStateSyncPayload = {
            id: getSessionID(),
            event: RealmEvent.SyncPresenceState,
            states: presenceStates,
          };
          socket?.send(JSON.stringify(fullSyncPayload));
        }
        // someone else has synced their entire presence state
        if (payload.event === RealmEvent.SyncPresenceState) {
          // TODO: currently you get a full sync from EVERYONE in the room
          // eventually we should only pick one person to sync from
          console.log('syncing states from someone else', payload.states);
          const { states } = payload;
          Object.entries(states).forEach(([key, state]) => {
            presenceStates[key] = {
              ...presenceStates[key],
              ...state,
            };
          });
          // fake presence state sync for self with newly merged states
          subscriptions[RealmEvent.SyncPresenceState]?.forEach((handler) => {
            const syncPayload: PresenceStateSyncPayload = {
              id: getSessionID(),
              event: RealmEvent.SyncPresenceState,
              states: presenceStates,
            };
            handler(syncPayload);
          });
          // dont send the normal payload through with the subscription handler below
          return;
        }
        try {
          subscriptions[payload.event]?.forEach((handler) => {
            handler(payload);
          });
        } catch (e) {}
      } catch (error) {
        console.error('Error handling websocket message', e, error);
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

export type SendPartial<T> = Omit<T, 'id'>;

export const send: RealmMultiplayerInterface['send'] = (payload) => {
  if (socket?.readyState !== WebSocket.OPEN || !ship) return;
  socket.send(
    JSON.stringify({
      ...payload,
      id: getSessionID(),
    })
  );
};

export const getPresenceState: RealmMultiplayerInterface['getPresenceState'] = (
  key: string
) => {
  return presenceStates[key];
};

function updatePresenceState(payload: PresenceStatePayload) {
  const { key, value } = payload;
  if (!presenceStates[key]) presenceStates[key] = {};
  presenceStates[key][payload.id] = value;
}

export const subscribe: RealmMultiplayerInterface['subscribe'] = (
  event,
  handler
) => {
  // add handler to subscription handlers for event
  subscriptions[event] = subscriptions[event] || new Set();
  subscriptions[event].add(handler);
  // returns an unsubscribe function
  return () => {
    subscriptions[event] && subscriptions[event].delete(handler);
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
  getPresenceState,
  send,
  subscribe,
  close,
};

function getSessionID() {
  if (!ship) throw new Error('ship not loaded');
  // @ts-ignore
  return globalThis.id + ship.patp;
}
