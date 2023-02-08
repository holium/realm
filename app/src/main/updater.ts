import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('autoUpdate', {
  // @ts-ignore
  listen: (callback) => ipcRenderer.on('auto-updater-message', callback),
  downloadUpdates: () => ipcRenderer.invoke('download-updates'),
  cancelUpdates: () => ipcRenderer.invoke('cancel-updates'),
  installUpdates: () => ipcRenderer.invoke('install-updates'),
});
