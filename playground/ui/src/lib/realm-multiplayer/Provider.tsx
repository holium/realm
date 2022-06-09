import React, { useEffect } from "react";
import { RealmMultiplayerInterface } from "../../../../../app/src/renderer/system/desktop/components/Multiplayer/types";

interface RealmMultiplayerContextState {
  ship?: any;
  channel?: string;
  api?: RealmMultiplayerInterface;
}

export const RealmMultiplayerContext =
  React.createContext<RealmMultiplayerContextState>({});

export function RealmMultiplayerProvider({
  channel,
  api,
  ship,
  children,
}: React.PropsWithChildren<RealmMultiplayerContextState>) {
  useEffect(() => {
    if (!channel || channel == "") return;
    const _api = api || globalThis.realmMultiplayer;
    try {
      if (!_api) throw new Error("realmMultiplayer api not preloaded");
      _api.init({ roomId: channel, ship });
    } catch (e) {
      console.error(e);
    }

    return () => {
      _api?.close();
    };
  }, [channel]);
  return (
    <RealmMultiplayerContext.Provider value={{ channel, ship, api }}>
      {children}
    </RealmMultiplayerContext.Provider>
  );
}
