import {
  RealmMultiplayerProvider as Provider,
  RealmMultiplayerContext as Context,
} from "./Provider";
import { Clickable } from "./Clickable";
import { useShips } from "./hooks";

import { RealmMultiplayerInterface } from "../../../../../app/src/renderer/system/desktop/components/Multiplayer/types";

declare global {
  var realmMultiplayer: RealmMultiplayerInterface | undefined;
}
export { Context, Provider, Clickable, useShips };
