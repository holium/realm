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
    globalThis.realmMultiplayer.init(channel);
  }, []);
  return (
    <RealmMultiplayerContext.Provider value={{ channel }}>
      {children}
    </RealmMultiplayerContext.Provider>
  );
}
