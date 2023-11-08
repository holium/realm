import { BrowserWindow, ipcMain } from 'electron';
import Store from 'electron-store';

import { fullScreenWindow } from './fullscreen';

const store = new Store();

const registerListeners = (mainWindow: BrowserWindow) => {
  ipcMain.removeHandler('toggle-devtools');
  ipcMain.removeHandler('enable-isolation-mode');
  ipcMain.removeHandler('disable-isolation-mode');

  ipcMain.handle('toggle-devtools', () => {
    if (mainWindow.isDestroyed()) return;

    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools();
    }
  });
  ipcMain.handle('enable-isolation-mode', () => {
    const isStandaloneChat = store.get('isStandaloneChat');
    if (isStandaloneChat) return;
    if (mainWindow.isDestroyed()) return;
    if (mainWindow.isKiosk()) return;

    mainWindow.setKiosk(true);
  });
  ipcMain.handle('disable-isolation-mode', () => {
    const isStandaloneChat = store.get('isStandaloneChat');
    if (isStandaloneChat) return;
    if (mainWindow.isDestroyed()) return;
    if (!mainWindow.isKiosk()) return;

    mainWindow.setKiosk(false);

    // Preserve fullscreen state.
    const isFullScreen = mainWindow.isFullScreen();
    if (isFullScreen) {
      fullScreenWindow(mainWindow, null);
    }
  });
};

export const DevHelper = { registerListeners };
