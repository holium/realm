import { contextBridge, ipcRenderer } from 'electron';
import { osPreload } from '../os/preload';

const appPreload = {
  setFullscreen(callback: any) {
    ipcRenderer.on('set-fullscreen', callback);
  },
  setAppviewPreload(callback: any) {
    ipcRenderer.on('set-appview-preload', callback);
  },
  setMouseColor(callback: any) {
    ipcRenderer.on('mouse-color', callback);
  },
  openApp: (app: any, partition: string) => {
    return ipcRenderer.invoke('open-app', app, partition);
  },
  setPartitionCookies: (partition: any, cookies: any) => {
    return ipcRenderer.invoke('set-partition-cookies', partition, cookies);
  },
  closeApp: (app: any) => {
    return ipcRenderer.invoke('close-app', app);
  },
  askForMicrophone: () => {
    return ipcRenderer.invoke('ask-for-microphone');
  },
  toggleDevTools: () => {
    return ipcRenderer.invoke('toggle-devtools');
  },
  onBrowserOpen(callback: any) {
    ipcRenderer.on('realm.browser.open', callback);
  },
  onInitialDimensions(callback: any) {
    ipcRenderer.on('set-dimensions', callback);
  },
};
export type AppPreloadType = typeof appPreload;

contextBridge.exposeInMainWorld('electron', {
  app: appPreload,
  os: osPreload,
});
