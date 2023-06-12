import { app, BrowserWindow, ipcMain } from 'electron';

import { toggleFullScreen } from './fullscreen';

const registerListeners = (mainWindow: BrowserWindow) => {
  ipcMain.removeHandler('close-realm');
  ipcMain.removeHandler('toggle-minimized');
  ipcMain.removeHandler('toggle-fullscreen');

  ipcMain.handle('close-realm', (_) => {
    mainWindow.close();
    app.quit();
  });

  ipcMain.handle('toggle-minimized', (_) => {
    mainWindow.isMinimized() ? mainWindow.restore() : mainWindow.minimize();
  });

  ipcMain.handle('toggle-fullscreen', (_) => {
    toggleFullScreen(mainWindow);
  });
};

export const TitlebarHelper = { registerListeners };
