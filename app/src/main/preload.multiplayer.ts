import { ipcRenderer } from 'electron';
import './helpers/mouseListener';
import { MouseState } from '@holium/realm-multiplayer';
import { Position } from 'os/types';

/** EVENT FORMAT: 'multiplayer.mouse-event.from-to' */
export const multiplayerPreload = {
  playerMouseOut(patp: string) {
    ipcRenderer.invoke('multiplayer.mouse-out', patp);
  },
  playerMouseMove(
    patp: string,
    normalizedPosition: Position,
    state: MouseState,
    hexColor: string
  ) {
    ipcRenderer.invoke(
      'multiplayer.mouse-move',
      patp,
      normalizedPosition,
      state,
      hexColor
    );
  },
  playerMouseDownRealmToMouseLayer(patp: string, elementId: string) {
    ipcRenderer.invoke(
      'multiplayer.mouse-down.realm-to-mouse-layer',
      patp,
      elementId
    );
  },
  playerMouseDownRealmToAppLayer(patp: string, elementId: string) {
    ipcRenderer.invoke(
      'multiplayer.mouse-down.realm-to-app-layer',
      patp,
      elementId
    );
  },
  playerMouseUp(patp: string) {
    ipcRenderer.invoke('multiplayer.mouse-up', patp);
  },
  multiplayerClickAppToRealm(patp: string, elementId: string) {
    ipcRenderer.invoke('multiplayer.click-app-to-realm', patp, elementId);
  },
  onPlayerMouseMove(
    callback: (
      patp: string,
      position: Position,
      state: MouseState,
      hexColor: string
    ) => void
  ) {
    ipcRenderer.on(
      'multiplayer.mouse-move',
      (
        _,
        patp: string,
        position: Position,
        state: MouseState,
        hexColor: string
      ) => {
        callback(patp, position, state, hexColor);
      }
    );
  },
  onPlayerMouseOut(callback: (patp: string) => void) {
    ipcRenderer.on('multiplayer.mouse-out', (_, patp: string) => {
      callback(patp);
    });
  },
  onPlayerMouseDown(callback: (patp: string, elementId: string) => void) {
    ipcRenderer.on('multiplayer.mouse-down', (_, patp: string, elementId) => {
      callback(patp, elementId);
    });
  },
  onPlayerMouseUp(callback: (patp: string) => void) {
    ipcRenderer.on('multiplayer.mouse-up', (_, patp: string) => {
      callback(patp);
    });
  },
  onPlayerMouseDownAppToRealm(
    callback: (patp: string, elementId: string) => void
  ) {
    ipcRenderer.on(
      'multiplayer.mouse-down.app-to-realm',
      (_, patp: string, elementId: string) => {
        callback(patp, elementId);
      }
    );
  },
};

export type MultiplayerPreloadType = typeof multiplayerPreload;
