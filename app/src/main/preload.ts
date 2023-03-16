import { contextBridge, ipcRenderer } from 'electron';
import { osPreload } from '../os/preload';
import './helpers/mouseListener';
import './helpers/keyListener';
import { MouseState } from '@holium/realm-presence';
import { Position, MediaAccess, MediaAccessStatus } from '../os/types';
import { multiplayerPreload } from './preload.multiplayer';
import Urbit from "@urbit/http-api";
import { TomeOptions } from '../tome/pkg';

const appPreload = {
  /* Senders */
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
  realmToAppEphemeralChat(patp: string, message: string) {
    ipcRenderer.invoke('realm-to-app.ephemeral-chat', patp, message);
  },
  /* Receivers */
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
  onKeyDown(callback: (key: string) => void) {
    ipcRenderer.on('key-down', (_, key: string) => {
      callback(key);
    });
  },
  onRealmToAppEphemeralChat(callback: (patp: string, message: string) => void) {
    ipcRenderer.on(
      'realm-to-app.ephemeral-chat',
      (_, patp: string, message: string) => {
        callback(patp, message);
      }
    );
  },
  /* Removers */
  removeOnKeyDown() {
    ipcRenderer.removeAllListeners('key-down');
  },
  removeOnMouseOut() {
    ipcRenderer.removeAllListeners('mouse-out');
  },
  removeOnMouseDown() {
    ipcRenderer.removeAllListeners('mouse-down');
  },
  removeOnMouseUp() {
    ipcRenderer.removeAllListeners('mouse-up');
  },
  removeOnMouseMove() {
    ipcRenderer.removeAllListeners('mouse-move');
  },
  removeOnMouseColorChange() {
    ipcRenderer.removeAllListeners('mouse-color');
  },
  removeOnEnableMouseLayerTracking() {
    ipcRenderer.removeAllListeners('enable-mouse-layer-tracking');
  },
  removeOnDisableCustomMouse() {
    ipcRenderer.removeAllListeners('disable-custom-mouse');
  },
  removeOnToggleOnEphemeralChat() {
    ipcRenderer.removeAllListeners('realm.toggle-on-ephemeral-chat');
  },
  removeOnToggleOffEphemeralChat() {
    ipcRenderer.removeAllListeners('realm.toggle-off-ephemeral-chat');
  },
  removeOnRealmToAppEphemeralChat() {
    ipcRenderer.removeAllListeners('realm-to-app.ephemeral-chat');
  },
};

const tomePreload = {
  /* Senders */
  initTome: (api?: Urbit, app?: string, options: TomeOptions = {}) => { 
    return ipcRenderer.invoke('init-tome', api, app, options);
  },
};

export type AppPreloadType = typeof appPreload;

contextBridge.exposeInMainWorld('electron', {
  app: appPreload,
  os: osPreload,
  multiplayer: multiplayerPreload,
  tome: tomePreload,
});
