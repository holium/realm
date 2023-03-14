import { BrowserWindow, ipcMain } from 'electron';

const registerListeners = (mainWindow: BrowserWindow) => {
  ipcMain.handle(
    'key-down',
    (_, key: string, isShift: boolean, isCapsLock: boolean) => {
      mainWindow.webContents.send('key-down', key, isShift, isCapsLock);
    }
  );
};

export const KeyHelper = { registerListeners };
