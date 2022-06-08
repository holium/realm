import { RealmMultiplayerProvider as Provider } from "./Provider";
import type { RealmMultiplayerInterface } from "../../../../../app/src/renderer/system/desktop/components/Multiplayer/types";
import { Clickable } from "./Clickable";

declare global {
  var realmMultiplayer: RealmMultiplayerInterface;
}

const realmMultiplayer = globalThis.realmMultiplayer;

export { Provider, realmMultiplayer, Clickable };
