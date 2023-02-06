import { contextBridge, ipcRenderer } from 'electron';
import { osPreload } from '../os/preload';
import './helpers/mouseListener';
import { MouseState, Vec2 } from '../renderer/system/mouse/AnimatedCursor';

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
  setWebViewPosition(webViewId: string, position: { x: number; y: number }) {
    ipcRenderer.invoke('webview-moved', webViewId, position);
  },
  mouseEnteredWebView(id: string) {
    ipcRenderer.invoke('mouse-entered-webview', id);
  },
  mouseLeftWebView(id: string) {
    ipcRenderer.invoke('mouse-left-webview', id);
  },
  mouseColorChanged(hex: string) {
    ipcRenderer.invoke('mouse-color', hex);
  },
  onMouseMove(
    callback: (
      coordinates: Vec2,
      state: MouseState,
      isDragging: boolean
    ) => void
  ) {
    ipcRenderer.on(
      'mouse-move',
      (_, coordinates: Vec2, state: MouseState, isDragging: boolean) => {
        callback(coordinates, state, isDragging);
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
};

export type AppPreloadType = typeof appPreload;

contextBridge.exposeInMainWorld('electron', {
  app: appPreload,
  os: osPreload,
});
