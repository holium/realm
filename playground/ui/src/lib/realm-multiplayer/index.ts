import { RealmMultiplayerProvider } from "./Provider";
import type { RealmMultiplayerInterface } from "../../../../../app/src/renderer/system/desktop/components/Multiplayer/types";

declare global {
  var realmMultiplayer: RealmMultiplayerInterface;
}

const realmMultiplayer = globalThis.realmMultiplayer;

export { RealmMultiplayerProvider, realmMultiplayer };
