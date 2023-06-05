import { app, BrowserWindow, ipcMain } from 'electron';

import { isArm64, isMac } from './env';

const toggleFullscreen = (mainWindow: BrowserWindow) => {
  if (isArm64 && isMac) {
    const wasSimpleFullscreen = mainWindow.isSimpleFullScreen();
    mainWindow.setSimpleFullScreen(!wasSimpleFullscreen);
    const initialDimensions = mainWindow.getBounds();
    if (wasSimpleFullscreen) {
      mainWindow.webContents.send('set-dimensions', initialDimensions);
      mainWindow.webContents.send('set-fullscreen', false);
    } else {
      initialDimensions.height = initialDimensions.height - 42;
      mainWindow.webContents.send('set-dimensions', initialDimensions);
      mainWindow.webContents.send('set-fullscreen', true);
    }
    // mainWindow.webContents.send('set-titlebar-visible', !wasSimpleFullscreen);
  } else {
    const wasFullscreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!wasFullscreen);
    mainWindow.setMenuBarVisibility(wasFullscreen);
    mainWindow.webContents.send('set-fullscreen', !wasFullscreen);
  }
};

const registerListeners = (mainWindow: BrowserWindow) => {
  ipcMain.handle('close-realm', (_) => {
    mainWindow.close();
    app.quit();
  });
  ipcMain.handle('toggle-minimized', (_) => {
    mainWindow.isMinimized() ? mainWindow.restore() : mainWindow.minimize();
  });

  ipcMain.handle('toggle-fullscreen', (_) => {
    toggleFullscreen(mainWindow);
  });
};

export const TitlebarHelper = { registerListeners };
