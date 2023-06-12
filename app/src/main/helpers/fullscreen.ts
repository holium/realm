import { BrowserWindow, ipcMain, screen } from 'electron';

import { isArm64, isMac } from './env';

export const NOTCH_HEIGHT = 32;

export const useSimpleFullscreen = isArm64 && isMac;

// ready-to-show is caused to be fired more than once by webviews,
// so we need to check if it's already been expanded from 0,0.
export const hasBeenExpanded = (window: BrowserWindow) => {
  const { width, height } = window.getBounds();
  return width > 0 && height > 0;
};

export const expandWindowToFullscreen = (window: BrowserWindow) => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const fullScreenBounds = {
    x: 0,
    y: 0 - NOTCH_HEIGHT,
    width,
    height: height + NOTCH_HEIGHT,
  };

  // Account for notch on arm64 mac with simple fullscreen.
  window.setBounds(fullScreenBounds);

  return fullScreenBounds;
};

export const toggleFullScreen = (
  window: BrowserWindow,
  forceFullscreen?: boolean,
  forceWindowed?: boolean
) => {
  if (useSimpleFullscreen) {
    const wasSimpleFullscreen = window.isSimpleFullScreen();
    if ((wasSimpleFullscreen || forceWindowed) && !forceFullscreen) {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;
      const nonFullScreenBounds = {
        x: 0,
        y: 0,
        width,
        height,
      };
      window.setFullScreen(false);
      window.setSimpleFullScreen(false);
      window.setBounds(nonFullScreenBounds);
      window.webContents.send('set-dimensions', nonFullScreenBounds);
      window.webContents.send('set-fullscreen', false);
    } else {
      window.setFullScreen(true);
      window.setSimpleFullScreen(true);
      const fullScreenBounds = expandWindowToFullscreen(window);
      window.webContents.send('set-dimensions', fullScreenBounds);
      window.webContents.send('set-fullscreen', true);
    }
  } else {
    const wasFullscreen = window.isFullScreen();

    if ((wasFullscreen || forceWindowed) && !forceFullscreen) {
      window.setFullScreen(false);
      window.setSimpleFullScreen(false);
      window.setMenuBarVisibility(true);
      window.webContents.send('set-fullscreen', false);
    } else {
      window.setFullScreen(true);
      window.setSimpleFullScreen(false);
      window.setMenuBarVisibility(false);
      window.webContents.send('set-fullscreen', true);
    }
  }
};

const registerListeners = (
  mainWindow: BrowserWindow,
  mouseWindow: BrowserWindow
) => {
  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('set-fullscreen', true);
    mainWindow.setMenuBarVisibility(false);
    mouseWindow.setAlwaysOnTop(true, 'screen-saver');
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('set-fullscreen', false);
    mainWindow.setMenuBarVisibility(true);
    mouseWindow.setAlwaysOnTop(false);
  });

  mainWindow.on('focus', mouseWindow.moveTop);

  ipcMain.removeHandler('set-fullscreen');
  ipcMain.removeHandler('is-fullscreen');

  ipcMain.handle('set-fullscreen', (_, forceFullScreen) => {
    toggleFullScreen(mainWindow, forceFullScreen, !forceFullScreen);
  });

  ipcMain.handle('is-fullscreen', () => {
    return mainWindow.isFullScreen();
  });
};

export const FullScreenHelper = { registerListeners };
