import { BrowserWindow, ipcMain } from 'electron';

const registerListeners = (mainWindow: BrowserWindow) => {
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
    // Preserve fullscreen state.
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setKiosk(false);
    mainWindow.setFullScreen(isFullScreen);
  });
};

export const DevHelper = { registerListeners };
