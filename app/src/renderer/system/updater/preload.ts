/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { contextBridge, ipcRenderer } = require('electron');

console.log('hello from updater preload.js');

contextBridge.exposeInMainWorld('autoUpdate', {
  listen: (callback) => ipcRenderer.on('auto-updater-message', callback),
  downloadUpdates: () => ipcRenderer.invoke('download-updates'),
  cancelUpdates: () => ipcRenderer.invoke('cancel-updates'),
  installUpdates: () => ipcRenderer.invoke('install-updates'),
});
