import { contextBridge, ipcRenderer } from 'electron';
import { AuthManager } from '../core/auth/manager';
import { ShipManager } from '../core/ship/manager';
import { RealmCore } from '../core';

contextBridge.exposeInMainWorld('electron', {
  auth: AuthManager.preload,
  ship: ShipManager.preload,
  core: RealmCore.preload,
  app: {
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
    toggleDevTools: () => {
      return ipcRenderer.invoke('toggle-devtools');
    },
  },
});
