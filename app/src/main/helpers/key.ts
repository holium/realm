import { BrowserWindow, ipcMain } from 'electron';

const registerListeners = (mainWindow: BrowserWindow) => {
  ipcMain.handle('key-down', (_, key: string, isFocused: boolean) => {
    mainWindow.webContents.send('key-down', key, isFocused);
  });
};

export const KeyHelper = { registerListeners };
