import { contextBridge, ipcRenderer } from 'electron';
import { osPreload } from '../os/preload';
import './preloads/add-mouse-listener';
import {
  MouseState,
  Vec2,
} from '../../../lib/mouse/src/components/AnimatedCursor';

const appPreload = {
  setFullscreen(callback: any) {
    ipcRenderer.on('set-fullscreen', callback);
  },
  setMouseColor(callback: any) {
    ipcRenderer.on('mouse-color', callback);
  },
  openApp: async (app: any, partition: string) => {
    return await ipcRenderer.invoke('open-app', app, partition);
  },
  setPartitionCookies: async (partition: any, cookies: any) => {
    return await ipcRenderer.invoke(
      'set-partition-cookies',
      partition,
      cookies
    );
  },
  closeApp: async (app: any) => {
    return await ipcRenderer.invoke('close-app', app);
  },
  askForMicrophone: async () => {
    return await ipcRenderer.invoke('ask-for-mic');
  },
  askForCamera: async () => {
    return await ipcRenderer.invoke('ask-for-camera');
  },
  getMediaStatus: async () => {
    return await ipcRenderer.invoke('get-media-status');
  },
  toggleDevTools: async () => {
    return await ipcRenderer.invoke('toggle-devtools');
  },
  onBrowserOpen(callback: any) {
    ipcRenderer.on('realm.browser.open', callback);
  },
  onInitialDimensions(callback: any) {
    ipcRenderer.on('set-dimensions', callback);
  },
  updateWebviewPosition: (id: string, position: { x: number; y: number }) => {
    ipcRenderer.invoke('updateWebviewPosition', id, position);
  },
  onMouseMove(callback: (coordinates: Vec2, state: MouseState) => void) {
    ipcRenderer.on('mouse-move', (_, coordinates: Vec2, state: MouseState) => {
      callback(coordinates, state);
    });
  },
  onMouseDown(callback: () => void) {
    ipcRenderer.on('mouse-down', callback);
  },
  onMouseUp(callback: () => void) {
    ipcRenderer.on('mouse-up', callback);
  },
};

export type AppPreloadType = typeof appPreload;

contextBridge.exposeInMainWorld('electron', {
  app: appPreload,
  os: osPreload,
});
