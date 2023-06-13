import { BrowserWindow, ipcMain } from 'electron';

import { fullScreenWindow } from './fullscreen';

const registerListeners = (mainWindow: BrowserWindow) => {
  ipcMain.removeHandler('toggle-devtools');
  ipcMain.removeHandler('enable-isolation-mode');
  ipcMain.removeHandler('disable-isolation-mode');

  ipcMain.handle('toggle-devtools', () => {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools();
    }
  });
  ipcMain.handle('enable-isolation-mode', () => {
    if (mainWindow.isKiosk()) return;
    mainWindow.setKiosk(true);
  });
  ipcMain.handle('disable-isolation-mode', () => {
    if (!mainWindow.isKiosk()) return;
    mainWindow.setKiosk(false);

    // Preserve fullscreen state.
    const isFullScreen = mainWindow.isFullScreen();
    if (isFullScreen) {
      fullScreenWindow(mainWindow);
    }
  });
};

export const DevHelper = { registerListeners };
