import { BrowserWindow, ipcMain } from 'electron';

const registerListeners = (mainWindow: BrowserWindow) => {
  ipcMain.handle('key-down', (_, key: string) => {
    mainWindow.webContents.send('key-down', key);
  });
};

export const KeyHelper = { registerListeners };
