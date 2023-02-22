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
    mainWindow.setKiosk(true);
  });
  ipcMain.handle('disable-isolation-mode', () => {
    mainWindow.setKiosk(false);
  });
};

export const DevHelper = { registerListeners };
