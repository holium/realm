import { BrowserWindow, ipcMain, session } from 'electron';

import { getPreloadPath } from '../util';

const registerListeners = (win: BrowserWindow) => {
  ipcMain.removeHandler('open-app');
  ipcMain.removeHandler('set-partition-cookies');

  ipcMain.handle(
    'open-app',
    (_, location: { url: string; cookies: any }, partition: string) => {
      session.fromPartition(partition).cookies.set(location.cookies);
    }
  );
  ipcMain.handle(
    'set-partition-cookies',
    async (_, partition: string, cookies: any) => {
      session.fromPartition(partition).cookies.set(cookies);
    }
  );

  win.webContents.on('will-attach-webview', (_, webPreferences) => {
    webPreferences.preload = getPreloadPath();
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.sandbox = false;
  });

  win.webContents.on('did-attach-webview', (_, webContents) => {
    webContents.on('dom-ready', () => {
      webContents.send('add-mouse-listeners');
      webContents.send('add-key-listeners');
    });
  });
};

export const WebViewHelper = { registerListeners };
