/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { contextBridge, ipcRenderer } = require('electron');

console.log('hello from progress.preload.js');
contextBridge.exposeInMainWorld('autoUpdate', {
  listen: (callback) => ipcRenderer.on('auto-updater-message', callback),
  installUpdates: () => ipcRenderer.invoke('install-updates'),
  cancelUpdates: () => ipcRenderer.invoke('cancel-updates'),
});
