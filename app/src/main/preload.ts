import { contextBridge, ipcRenderer } from 'electron';
import { osPreload } from '../os/preload';
import './helpers/mouseListener';
import { MouseState } from '@holium/realm-multiplayer';
import { MediaAccess, MediaAccessStatus } from '../os/types';
import { Position } from 'os/types';

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
  /**
   * For macOS we enable mouse layer tracking for a smoother experience.
   * It is not supported for Windows or Linux.
   */
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
  onMouseDown(callback: (position: Position, elementId: string) => void) {
    ipcRenderer.on('mouse-down', (_, position: Position, elementId: string) =>
      callback(position, elementId)
    );
  },
  onMouseUp(callback: () => void) {
    ipcRenderer.on('mouse-up', callback);
  },
  onMouseColorChange(callback: (hex: string) => void) {
    ipcRenderer.on('mouse-color', (_, hex: string) => {
      callback(hex);
    });
  },
  multiplayerMouseOut(patp: string) {
    ipcRenderer.invoke('multiplayer-mouse-out', patp);
  },
  multiplayerMouseMove(
    patp: string,
    normalizedPosition: Position,
    state: MouseState,
    hexColor: string
  ) {
    ipcRenderer.invoke(
      'multiplayer-mouse-move',
      patp,
      normalizedPosition,
      state,
      hexColor
    );
  },
  multiplayerMouseDown(patp: string, elementId: string) {
    ipcRenderer.invoke('multiplayer-mouse-down', patp, elementId);
  },
  multiplayerMouseUp(patp: string) {
    ipcRenderer.invoke('multiplayer-mouse-up', patp);
  },
  multiplayerClickFromApp(patp: string, elementId: string) {
    ipcRenderer.invoke('multiplayer-click-from-app', patp, elementId);
  },
  onMultiplayerMouseMove(
    callback: (
      patp: string,
      position: Position,
      state: MouseState,
      hexColor: string
    ) => void
  ) {
    ipcRenderer.on(
      'multiplayer-mouse-move',
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
  onMultiplayerMouseOut(callback: (patp: string) => void) {
    ipcRenderer.on('multiplayer-mouse-out', (_, patp: string) => {
      callback(patp);
    });
  },
  onMultiplayerMouseDown(callback: (patp: string, elementId: string) => void) {
    ipcRenderer.on('multiplayer-mouse-down', (_, patp: string, elementId) => {
      callback(patp, elementId);
    });
  },
  onMultiplayerMouseUp(callback: (patp: string) => void) {
    ipcRenderer.on('multiplayer-mouse-up', (_, patp: string) => {
      callback(patp);
    });
  },
  onMultiplayerClickFromApp(
    callback: (patp: string, elementId: string) => void
  ) {
    ipcRenderer.on(
      'multiplayer-click-from-app',
      (_, patp: string, elementId) => {
        callback(patp, elementId);
      }
    );
  },
};

export type AppPreloadType = typeof appPreload;

contextBridge.exposeInMainWorld('electron', {
  app: appPreload,
  os: osPreload,
});
