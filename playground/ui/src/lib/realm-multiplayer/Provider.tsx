import React, { useEffect, useState } from "react";
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
  const [_api, setApi] = useState<RealmMultiplayerInterface | undefined>(api);
  useEffect(() => {
    if (!channel || channel == "") return;
    const _api = api || globalThis.realmMultiplayer;
    setApi(_api);
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
    <RealmMultiplayerContext.Provider value={{ channel, ship, api: _api }}>
      {children}
    </RealmMultiplayerContext.Provider>
  );
}
