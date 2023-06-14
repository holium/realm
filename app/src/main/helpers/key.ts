import { BrowserWindow, ipcMain } from 'electron';

const registerListeners = (mainWindow: BrowserWindow) => {
  ipcMain.removeHandler('key-down');

  ipcMain.handle('key-down', (_, key: string, isFocused: boolean) => {
    if (mainWindow.isDestroyed()) return;

    mainWindow.webContents.send('key-down', key, isFocused);
  });
};

export const KeyHelper = { registerListeners };
