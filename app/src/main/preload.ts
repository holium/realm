import { toggleDevTools } from 'renderer/logic/desktop/api';
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
    openApp(app: any) {
      ipcRenderer.invoke('open-app', app);
    },
    closeApp(app: any) {
      ipcRenderer.invoke('close-app', app);
    },
    toggleDevTools() {
      ipcRenderer.invoke('toggle-devtools');
    },
  },
});
