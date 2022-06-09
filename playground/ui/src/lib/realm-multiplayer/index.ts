import {
  RealmMultiplayerProvider as Provider,
  RealmMultiplayerContext as Context,
} from "./Provider";
import type { RealmMultiplayerInterface } from "../../../../../app/src/renderer/system/desktop/components/Multiplayer/types";
import { Clickable } from "./Clickable";

declare global {
  var realmMultiplayer: RealmMultiplayerInterface | undefined;
}

const realmMultiplayer = globalThis.realmMultiplayer;

export { Context, Provider, realmMultiplayer, Clickable };
