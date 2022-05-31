import { BrowserWindow, ipcMain, session } from 'electron';

export const registerListeners = (mainWindow: BrowserWindow) => {
  ipcMain.handle(
    'open-app',
    (_event, location: { url: string; cookies: any }) => {
      session.fromPartition('app-webview').cookies.set(location.cookies);
      return;
    }
  );

  // // TODO make a better structure for partition sessions
  // ipcMain.handle(
  //   'set-partition-cookie',
  //   async (_event, data: { partition: string; cookies: any }) => {
  //     // console.log('cookies', location.cookies);
  //     // session.defaultSession.cookies.set(location.cookies);
  //     session.fromPartition(data.partition).cookies.set(data.cookies);
  //   }
  // );

  ipcMain.handle('close-app', async (event, location: any) => {
    const views = mainWindow!.getBrowserViews();
  });
};

export default { registerListeners };
