import React, { useEffect } from "react";
import type { RealmMultiplayerInterface } from "../../../../../app/src/renderer/system/desktop/components/Multiplayer/types";

declare global {
  var realmMultiplayer: RealmMultiplayerInterface;
}

interface RealmMultiplayerContextState {
  channel: string;
}
const RealmMultiplayerContext =
  React.createContext<RealmMultiplayerContextState>({
    channel: "/",
  });
interface RealmMultiplayerProviderProps {
  channel: string;
}
export function RealmMultiplayerProvider({
  channel,
  children,
}: React.PropsWithChildren<RealmMultiplayerProviderProps>) {
  useEffect(() => {
    globalThis.realmMultiplayer.init(channel);
  }, []);
  return (
    <RealmMultiplayerContext.Provider value={{ channel }}>
      {children}
    </RealmMultiplayerContext.Provider>
  );
}
