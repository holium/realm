import { BrowserWindow, ipcMain, session } from 'electron';

export const registerListeners = (mainWindow: BrowserWindow) => {
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

  ipcMain.handle('close-app', async (event, location: any) => {
    const views = mainWindow.getBrowserViews();
  });
};

export default { registerListeners };
