import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { AuthManager } from '../core/auth/manager';
import { ShipManager } from '../core/ship/manager';
import { RealmCore } from '../core';
// import AuthManager from '../core/auth/manager';

contextBridge.exposeInMainWorld('electron', {
  auth: AuthManager.preload,
  ship: ShipManager.preload,
  core: RealmCore.preload,
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel: string, func: (...args: unknown[]) => void) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
          func(...args);
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, subscription);

        return () => ipcRenderer.removeListener(channel, subscription);
      }

      return undefined;
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (_event, ...args) => func(...args));
      }
    },
  },
});
