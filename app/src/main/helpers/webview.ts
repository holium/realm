import { BrowserWindow, ipcMain, session } from 'electron';

export const registerListeners = (mainWindow: BrowserWindow) => {
  ipcMain.handle(
    'open-app',
    async (_event, location: { url: string; cookies: any }) => {
      // console.log('cookies', location.cookies);
      // session.defaultSession.cookies.set(location.cookies);
      session.fromPartition('app-webview').cookies.set(location.cookies);
    }
  );

  ipcMain.handle('close-app', async (event, location: any) => {
    const views = mainWindow!.getBrowserViews();
  });
};

export default { registerListeners };
