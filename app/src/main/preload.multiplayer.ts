import { ipcRenderer } from 'electron';
import { PresenceArg, MouseState } from '@holium/realm-presence';
import { Position } from '../os/types';

export const multiplayerPreload = {
  mouseOut(patp: string) {
    ipcRenderer.invoke('multiplayer.mouse-out', patp);
  },
  mouseMove(
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
  mouseDown(patp: string) {
    ipcRenderer.invoke('multiplayer.mouse-down', patp);
  },
  mouseUp(patp: string) {
    ipcRenderer.invoke('multiplayer.mouse-up', patp);
  },
  appToRealmMouseClick(patp: string, elementId: string) {
    ipcRenderer.invoke('multiplayer.app-to-realm.mouse-click', patp, elementId);
  },
  realmToAppMouseClick(patp: string, elementId: string) {
    ipcRenderer.invoke('multiplayer.realm-to-app.mouse-click', patp, elementId);
  },
  appToRealmSendTransaction(
    patp: string,
    version: number,
    steps: any,
    clientID: string | number
  ) {
    ipcRenderer.invoke(
      'multiplayer.app-to-realm.send-transaction',
      patp,
      version,
      steps,
      clientID
    );
  },
  realmToAppSendTransaction(
    patp: string,
    version: number,
    steps: any,
    clientID: string | number
  ) {
    ipcRenderer.invoke(
      'multiplayer.realm-to-app.send-transaction',
      patp,
      version,
      steps,
      clientID
    );
  },
  appToRealmBroadcast<T extends PresenceArg[]>(...data: T) {
    ipcRenderer.invoke('presence.app-to-realm.broadcast', ...data);
  },
  realmToAppBroadcast<T extends PresenceArg[]>(...data: T) {
    ipcRenderer.invoke('presence.realm-to-app.broadcast', ...data);
  },
  onMouseMove(
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
  onMouseOut(callback: (patp: string) => void) {
    ipcRenderer.on('multiplayer.mouse-out', (_, patp: string) => {
      callback(patp);
    });
  },
  onMouseDown(callback: (patp: string) => void) {
    ipcRenderer.on('multiplayer.mouse-down', (_, patp: string) => {
      callback(patp);
    });
  },
  onMouseUp(callback: (patp: string) => void) {
    ipcRenderer.on('multiplayer.mouse-up', (_, patp: string) => {
      callback(patp);
    });
  },
  onAppToRealmMouseClick(callback: (patp: string, elementId: string) => void) {
    ipcRenderer.on(
      'multiplayer.app-to-realm.mouse-click',
      (_, patp: string, elementId) => {
        callback(patp, elementId);
      }
    );
  },
  onRealmToAppMouseClick(callback: (patp: string, elementId: string) => void) {
    ipcRenderer.on(
      'multiplayer.realm-to-app.mouse-click',
      (_, patp: string, elementId) => {
        callback(patp, elementId);
      }
    );
  },
  onAppToRealmSendTransaction(
    callback: (
      patp: string,
      version: number,
      steps: any,
      clientID: string | number
    ) => void
  ) {
    ipcRenderer.on(
      'multiplayer.app-to-realm.send-transaction',
      (_, patp: string, version: number, steps: string, clientID: string) => {
        callback(patp, version, steps, clientID);
      }
    );
  },
  onRealmToAppSendTransaction(
    callback: (
      patp: string,
      version: number,
      steps: any,
      clientID: string | number
    ) => void
  ) {
    ipcRenderer.on(
      'multiplayer.realm-to-app.send-transaction',
      (
        _,
        patp: string,
        version: number,
        steps: any,
        clientID: string | number
      ) => {
        callback(patp, version, steps, clientID);
      }
    );
  },
  onAppToRealmBroadcast<T extends PresenceArg[]>(
    callback: (...data: T) => void
  ) {
    ipcRenderer.on('presence.app-to-realm.broadcast', (_, ...data) => {
      callback(...(data as T));
    });
  },
  onRealmToAppBroadcast<T extends PresenceArg[]>(
    callback: (...data: T) => void
  ) {
    ipcRenderer.on('presence.realm-to-app.broadcast', (_, ...data) => {
      callback(...(data as T));
    });
  },
  onRealmToAppSendChat(callback: (patp: string, message: string) => void) {
    ipcRenderer.on(
      'multiplayer.realm-to-app.send-chat',
      (_, patp: string, message: string) => {
        callback(patp, message);
      }
    );
  },
  realmToAppSendChat(patp: string, message: string) {
    ipcRenderer.invoke('multiplayer.realm-to-app.send-chat', patp, message);
  },
  /* Removers */
  removeOnAppToRealmMouseClick() {
    ipcRenderer.removeAllListeners('multiplayer.app-to-realm.mouse-click');
  },
  removeOnAppToRealmBroadcast() {
    ipcRenderer.removeAllListeners('multiplayer.app-to-realm.broadcast');
  },
};

export type MultiplayerPreloadType = typeof multiplayerPreload;
