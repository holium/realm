import { contextBridge, ipcRenderer, IpcRendererEvent, app } from 'electron';
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
    openApp(app: any) {
      ipcRenderer.invoke('open-app', app);
    },
    closeApp(app: any) {
      ipcRenderer.invoke('close-app', app);
    },
  },
  // ipcRenderer: {
  //   myPing() {
  //     ipcRenderer.send('ipc-example', 'ping');
  //   },
  //   on(channel: string, func: (...args: unknown[]) => void) {
  //     const validChannels = ['ipc-example'];
  //     if (validChannels.includes(channel)) {
  //       const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
  //         func(...args);
  //       // Deliberately strip event as it includes `sender`
  //       ipcRenderer.on(channel, subscription);

  //       return () => ipcRenderer.removeListener(channel, subscription);
  //     }

  //     return undefined;
  //   },
  //   once(channel: string, func: (...args: unknown[]) => void) {
  //     const validChannels = ['ipc-example'];
  //     if (validChannels.includes(channel)) {
  //       // Deliberately strip event as it includes `sender`
  //       ipcRenderer.once(channel, (_event, ...args) => func(...args));
  //     }
  //   },
  // },
});
