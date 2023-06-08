import { app, BrowserWindow, ipcMain } from 'electron';

import { isArm64, isMac } from './env';

export const toggleFullScreen = (mainWindow: BrowserWindow) => {
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
  } else {
    const wasFullscreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!wasFullscreen);
    mainWindow.setMenuBarVisibility(wasFullscreen);
    mainWindow.webContents.send('set-fullscreen', !wasFullscreen);
  }
};

export const setFullScreen = (
  mainWindow: BrowserWindow,
  isFullscreen: boolean
) => {
  if (isArm64 && isMac) {
    mainWindow.setSimpleFullScreen(isFullscreen);
    const initialDimensions = mainWindow.getBounds();
    if (isFullscreen) {
      initialDimensions.height = initialDimensions.height - 42;
      mainWindow.webContents.send('set-dimensions', initialDimensions);
      mainWindow.webContents.send('set-fullscreen', true);
    } else {
      mainWindow.webContents.send('set-dimensions', initialDimensions);
      mainWindow.webContents.send('set-fullscreen', false);
    }
  } else {
    mainWindow.setFullScreen(isFullscreen);
    mainWindow.setMenuBarVisibility(!isFullscreen);
    mainWindow.webContents.send('set-fullscreen', isFullscreen);
  }
};

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
