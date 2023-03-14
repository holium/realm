import { contextBridge, ipcRenderer } from 'electron';
import { osPreload } from '../os/preload';
import './helpers/mouseListener';
import { MouseState } from '@holium/realm-presences';
import { Position, MediaAccess, MediaAccessStatus } from '../os/types';
import { multiplayerPreload } from './preload.multiplayer';

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
  setMouseColor(hex: string) {
    ipcRenderer.invoke('mouse-color', hex);
  },
  toggleOnEphemeralChat() {
    ipcRenderer.invoke('realm.toggle-on-ephemeral-chat');
  },
  toggleOffEphemeralChat() {
    ipcRenderer.invoke('realm.toggle-off-ephemeral-chat');
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
  onToggleOnEphemeralChat(callback: () => void) {
    ipcRenderer.on('realm.toggle-on-ephemeral-chat', () => {
      callback();
    });
  },
  onToggleOffEphemeralChat(callback: () => void) {
    ipcRenderer.on('realm.toggle-off-ephemeral-chat', () => {
      callback();
    });
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
  onMouseDown(callback: () => void) {
    ipcRenderer.on('mouse-down', callback);
  },
  onMouseUp(callback: () => void) {
    ipcRenderer.on('mouse-up', callback);
  },
  onMouseColorChange(callback: (hex: string) => void) {
    ipcRenderer.on('mouse-color', (_, hex: string) => {
      callback(hex);
    });
  },
  realmToAppEphemeralChat(patp: string, message: string) {
    ipcRenderer.invoke('realm-to-app.ephemeral-chat', patp, message);
  },
  onRealmToAppEphemeralChat(callback: (patp: string, message: string) => void) {
    ipcRenderer.on(
      'realm-to-app.ephemeral-chat',
      (_, patp: string, message: string) => {
        callback(patp, message);
      }
    );
  },
};

export type AppPreloadType = typeof appPreload;

contextBridge.exposeInMainWorld('electron', {
  app: appPreload,
  os: osPreload,
  multiplayer: multiplayerPreload,
});
