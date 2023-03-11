import { contextBridge, ipcRenderer } from 'electron';
import { osPreload } from '../os/preload';
import './helpers/mouseListener';
import { MouseState, Vec2 } from '../renderer/system/mouse/AnimatedCursor';
import { MediaAccess, MediaAccessStatus } from '../os/types';

const appPreload = {
  setFullscreen(callback: any) {
    ipcRenderer.on('set-fullscreen', callback);
  },
  setMouseColor(callback: any) {
    ipcRenderer.on('mouse-color', callback);
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
  onMouseOver(callback: () => void) {
    ipcRenderer.on('mouse-over', callback);
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
