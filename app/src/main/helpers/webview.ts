import { ipcMain, session } from 'electron';
import { WebViewsData } from 'main/main';

export const registerListeners = (webviews: WebViewsData) => {
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
      webviews[webviewId] = { position, hasMouseInside: false };
    }
  );
};

export default { registerListeners };
