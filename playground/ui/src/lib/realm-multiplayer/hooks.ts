import { useCallback, useContext, useEffect, useState } from "react";
import { SendPartial } from "../../../../../app/src/renderer/system/desktop/components/Multiplayer/multiplayer";
import {
  BaseRealmPayload,
  PresenceStatePayload,
  RealmEvent,
} from "../../../../../app/src/renderer/system/desktop/components/Multiplayer/types";
import { RealmMultiplayerContext } from "./Provider";

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

export interface Ship {
  color: string;
  patp: string;
}

export function useShips() {
  const { api } = useContext(RealmMultiplayerContext);
  const [ships, setShips] = useState<Record<string, Ship>>({});

  useEffect(() => {
    if (!api) return;

    const unsub = api.subscribe<PresenceStatePayload>(
      RealmEvent.UpdatePresenceState,
      (payload) => {
        console.log("update payload got", payload);
        if (payload.key === "ship") {
          setShips((prev) => ({ ...prev, [payload.id]: payload.value }));
        }
      }
    );
    return () => {
      unsub();
    };
  }, [api]);

  return ships;
}
