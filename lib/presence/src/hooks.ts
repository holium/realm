import { useCallback, useContext, useEffect, useState } from 'react';
import {
  SendPartial,
  BaseRealmPayload,
  PresenceStatePayload,
  PresenceStateSyncPayload,
  RealmEvent,
  Ship,
} from './types';
import { RealmMultiplayerContext } from './Provider';

export function useChannel<T extends BaseRealmPayload>(
  event: string,
  handler: (payload: T) => void
) {
  const { api } = useContext(RealmMultiplayerContext);
  const send = useCallback(
    (payload: SendPartial<T>) => {
      api?.send<SendPartial<T>>(payload);
    },
    [api]
  );

  useEffect(() => {
    if (!api) return;
    const unsub = api?.subscribe<T>(event, handler);

    return () => {
      unsub?.();
    };
  }, [api]);
  return send;
}

export function useShips() {
  return usePresence('ship');
}

export function usePresence(key: string) {
  const { api } = useContext(RealmMultiplayerContext);
  const [ships, setShips] = useState<Record<string, Ship>>({});

  useEffect(() => {
    if (!api) return;

    const unsub = [
      api.subscribe<PresenceStatePayload>(
        RealmEvent.UpdatePresenceState,
        (payload) => {
          if (payload.key === key) {
            setShips((prev) => ({ ...prev, [payload.id]: payload.value }));
          }
        }
      ),
      api.subscribe<PresenceStateSyncPayload>(
        RealmEvent.SyncPresenceState,
        (payload) => {
          if (payload.states.hasOwnProperty(key)) {
            setShips(payload.states[key]);
          }
        }
      ),
    ];

    return () => {
      unsub.forEach((u) => u());
    };
  }, [api, key]);

  return ships;
}
