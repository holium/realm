import React, { useEffect } from "react";

interface RealmMultiplayerContextState {
  channel: string;
}

const RealmMultiplayerContext =
  React.createContext<RealmMultiplayerContextState>({
    channel: "/",
  });

export function RealmMultiplayerProvider({
  channel,
  children,
}: React.PropsWithChildren<RealmMultiplayerContextState>) {
  useEffect(() => {
    try {
      if (!globalThis.realmMultiplayer)
        throw new Error("realmMultiplayer api not preloaded");
      globalThis.realmMultiplayer.init(channel);
    } catch (e) {
      console.error(e);
    }
  }, []);
  return (
    <RealmMultiplayerContext.Provider value={{ channel }}>
      {children}
    </RealmMultiplayerContext.Provider>
  );
}
