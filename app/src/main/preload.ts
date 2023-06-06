import { contextBridge, ipcRenderer } from 'electron';

import { Position } from '@holium/design-system';
import { MouseState } from '@holium/realm-presence';

import { settingsPreload } from 'os/services/ship/settings.service';
import { bazaarPreload } from 'os/services/ship/spaces/bazaar.service';
import { spacesPreload } from 'os/services/ship/spaces/spaces.service';

import { realmPreload } from '../os/realm.service';
import { authPreload } from '../os/services/auth/auth.service';
import { onboardingPreload } from '../os/services/auth/onboarding.service';
import { chatPreload } from '../os/services/ship/chat/chat.service';
import { friendsPreload } from '../os/services/ship/friends.service';
import { notifPreload } from '../os/services/ship/notifications/notifications.service';
import { shipPreload } from '../os/services/ship/ship.service';
import { appPublishersDBPreload } from '../os/services/ship/spaces/tables/appPublishers.table';
import { appRecentsPreload } from '../os/services/ship/spaces/tables/appRecents.table';
import { walletPreload } from '../os/services/ship/wallet/wallet.service';
import { MediaAccess, MediaAccessStatus } from '../os/types';
import { multiplayerPreload } from './preload.multiplayer';

import './helpers/mouseListener';
import './helpers/keyListener';

const appPreload = {
  setPartitionCookie: (partition: string, cookie: any) => {
    ipcRenderer.send('set-partition-cookie', partition, cookie);
  },
  downloadUrlAsFile: (url: string) =>
    ipcRenderer.send('download-url-as-file', { url }),
  /* Senders */
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
  setFullscreen: (isFullscreen: boolean) => {
    return ipcRenderer.invoke('set-fullscreen', isFullscreen);
  },
  isFullscreen: () => {
    return ipcRenderer.invoke('is-fullscreen');
  },
  setStandaloneChat: (isStandaloneChat: boolean) => {
    return ipcRenderer.invoke('set-standalone-chat', isStandaloneChat);
  },
  isStandaloneChat: () => {
    return ipcRenderer.invoke('is-standalone-chat');
  },
  enableIsolationMode: () => {
    return ipcRenderer.invoke('enable-isolation-mode');
  },
  disableIsolationMode: () => {
    return ipcRenderer.invoke('disable-isolation-mode');
  },
  enableRealmCursor: () => {
    return ipcRenderer.invoke('enable-realm-cursor');
  },
  disableRealmCursor: () => {
    return ipcRenderer.invoke('disable-realm-cursor');
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
  onSetFullScreen(callback: (isFullscreen: boolean) => void) {
    ipcRenderer.on('set-fullscreen', (_, isFullscreen) => {
      callback(isFullscreen);
    });
  },
  onBrowserOpen(callback: any) {
    ipcRenderer.on('realm.browser.open', callback);
  },
  onDimensionsChange(callback: any) {
    ipcRenderer.on('set-dimensions', callback);
  },
  onMouseOut(callback: () => void) {
    ipcRenderer.on('mouse-out', callback);
  },
  onEnableMouseLayerTracking(callback: () => void) {
    ipcRenderer.on('enable-mouse-layer-tracking', callback);
  },
  onEnableRealmCursor(callback: () => void) {
    ipcRenderer.on('enable-realm-cursor', callback);
  },
  onDisableRealmCursor(callback: () => void) {
    ipcRenderer.on('disable-realm-cursor', callback);
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
  onKeyDown(callback: (key: string, isFocused: boolean) => void) {
    ipcRenderer.on('key-down', (_, key: string, isFocused: boolean) => {
      callback(key, isFocused);
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
  /* Deeplink listeners */
  onJoinSpace(callback: (spacePath: string) => void) {
    ipcRenderer.on('join-space', (_, spacePath: string) => {
      callback(spacePath);
    });
  },

  onSetTitlebarVisible(callback: (isVisible: boolean) => void) {
    ipcRenderer.on('set-titlebar-visible', (_, isVisible: boolean) => {
      callback(isVisible);
    });
  },
  toggleMinimized: () => {
    return ipcRenderer.invoke('toggle-minimized');
  },
  closeRealm: () => {
    return ipcRenderer.invoke('close-realm');
  },
  toggleFullscreen: () => {
    return ipcRenderer.invoke('toggle-fullscreen');
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
  removeOnJoinSpace() {
    ipcRenderer.removeAllListeners('join-space');
  },
};

export type AppPreloadType = typeof appPreload;

contextBridge.exposeInMainWorld('electron', {
  app: appPreload,
  multiplayer: multiplayerPreload,
});

contextBridge.exposeInMainWorld('realm', realmPreload);
contextBridge.exposeInMainWorld('shipService', shipPreload);
contextBridge.exposeInMainWorld('spacesService', spacesPreload);
contextBridge.exposeInMainWorld('authService', authPreload);
contextBridge.exposeInMainWorld('chatService', chatPreload);
contextBridge.exposeInMainWorld('walletService', walletPreload);
contextBridge.exposeInMainWorld('notifService', notifPreload);
contextBridge.exposeInMainWorld('friendDb', friendsPreload);
contextBridge.exposeInMainWorld('bazaarService', bazaarPreload);
contextBridge.exposeInMainWorld('onboardingService', onboardingPreload);
contextBridge.exposeInMainWorld('appInstallService', appPublishersDBPreload);
contextBridge.exposeInMainWorld('appRecentsService', appRecentsPreload);
contextBridge.exposeInMainWorld('settingsService', settingsPreload);
