import { BrowserWindow, ipcMain, session } from 'electron';
import { getPreloadPath, WebViewsData } from '../main';
import { hideCursor } from './hideCursor';

export const registerListeners = (
  mainWindow: BrowserWindow,
  webviews: WebViewsData
) => {
  ipcMain.handle(
    'open-app',
    (_event, location: { url: string; cookies: any }, partition: string) => {
      session.fromPartition(partition).cookies.set(location.cookies);
    }
  );

  ipcMain.handle(
    'set-partition-cookies',
    async (_event, partition: string, cookies: any) => {
      session.fromPartition(partition).cookies.set(cookies);
    }
  );

  ipcMain.handle(
    'webview-moved',
    (_, webviewId: string, position: { x: number; y: number }) => {
      console.log('webview moved', webviewId, position);
      webviews[webviewId] = { position, hasMouseInside: false };
    }
  );

  mainWindow.webContents.on('will-attach-webview', (_, webPreferences) => {
    webPreferences.preload = getPreloadPath();
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.sandbox = false;
  });

  mainWindow.webContents.on('did-attach-webview', (_, webContents) => {
    webContents.on('dom-ready', () => {
      hideCursor(webContents);
      webContents.send('add-mouse-listeners', { isWebview: true });
    });
  });
};

export default { registerListeners };
