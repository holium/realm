import { contextBridge, ipcRenderer } from 'electron';
import { Position, MediaAccess, MediaAccessStatus } from '../os/types';
import { osPreload } from '../os/preload';
import './helpers/mouseListener';
import { MouseState } from '@holium/realm-multiplayer';

const appPreload = {
  setFullscreen(callback: any) {
    ipcRenderer.on('set-fullscreen', callback);
  },
  openApp: (app: any, partition: string) => {
    return ipcRenderer.invoke('open-app', app, partition);
  },
  closeApp: (app: any) => {
    return ipcRenderer.invoke('close-app', app);
  },
  askForMicrophone: (): Promise<MediaAccessStatus> => {
    return ipcRenderer.invoke('ask-for-mic');
  },
  askForCamera: (): Promise<MediaAccessStatus> => {
    return ipcRenderer.invoke('ask-for-camera');
  },
  getMediaStatus: (): Promise<MediaAccess> => {
    return ipcRenderer.invoke('get-media-status');
  },
  toggleDevTools: () => {
    return ipcRenderer.invoke('toggle-devtools');
  },
  enableIsolationMode: () => {
    return ipcRenderer.invoke('enable-isolation-mode');
  },
  disableIsolationMode: () => {
    return ipcRenderer.invoke('disable-isolation-mode');
  },
  onBrowserOpen(callback: any) {
    ipcRenderer.on('realm.browser.open', callback);
  },
  onInitialDimensions(callback: any) {
    ipcRenderer.on('set-dimensions', callback);
  },
  onMouseOut(callback: () => void) {
    ipcRenderer.on('mouse-out', callback);
  },
  onEnableMouseLayerTracking(callback: () => void) {
    ipcRenderer.on('enable-mouse-layer-tracking', callback);
  },
  onDisableCustomMouse(callback: () => void) {
    ipcRenderer.on('disable-custom-mouse', callback);
  },
  setMouseColor(hex: string) {
    ipcRenderer.invoke('mouse-color', hex);
  },
  onMouseMove(
    callback: (
      position: Position,
      state: MouseState,
      isDragging: boolean
    ) => void
  ) {
    ipcRenderer.on(
      'mouse-move',
      (_, position: Position, state: MouseState, isDragging: boolean) => {
        callback(position, state, isDragging);
      }
    );
  },
  onMouseDown(callback: (elementId: string) => void) {
    ipcRenderer.on('mouse-down', (_, elementId: string) => callback(elementId));
  },
  onMouseUp(callback: (elementId: string) => void) {
    ipcRenderer.on('mouse-up', (_, elementId: string) => callback(elementId));
  },
  onMouseColorChange(callback: (hex: string) => void) {
    ipcRenderer.on('mouse-color', (_, hex: string) => {
      callback(hex);
    });
  },
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
  playerMouseDownAppToRealm(patp: string, elementId: string) {
    ipcRenderer.invoke('multiplayer.mouse-down.app-to-realm', patp, elementId);
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
    ipcRenderer.on(
      'multiplayer.mouse-down.app-to-realm',
      (_, patp: string, elementId) => {
        callback(patp, elementId);
      }
    );
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

export type AppPreloadType = typeof appPreload;

contextBridge.exposeInMainWorld('electron', {
  os: osPreload,
  app: appPreload,
});
