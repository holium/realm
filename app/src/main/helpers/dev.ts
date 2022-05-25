import { BrowserWindow, ipcMain, session } from 'electron';

export const registerListeners = (mainWindow: BrowserWindow) => {
  ipcMain.handle('toggle-devtools', async (event: any) => {
    console.log('hello');
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools();
    }
  });
};

export default { registerListeners };
