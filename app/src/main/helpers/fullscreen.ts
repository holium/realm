import { BrowserWindow, ipcMain, screen } from 'electron';

import { isArm64, isMac } from './env';

// Get the menu bar of new macs with notch.
const getMenubarHeight = () => {
  return (
    screen.getPrimaryDisplay().bounds.height -
    screen.getPrimaryDisplay().workAreaSize.height
  );
};

export const useSimpleFullscreen = isArm64 && isMac;

// ready-to-show is caused to be fired more than once by webviews,
// so we need to check if it's already been expanded from 0,0.
export const hasBeenExpanded = (window: BrowserWindow) => {
  const { width, height } = window.getBounds();
  // On Windows, windows can't be 0,0.
  return width > 200 && height > 50;
};

export const getWindowedBounds = () => {
  const scaleFactor = screen.getPrimaryDisplay().scaleFactor;
  const windowedBounds = {
    width: 700 * (scaleFactor > 0 ? scaleFactor : 1),
    height: 500 * (scaleFactor > 0 ? scaleFactor : 1),
  };

  return windowedBounds;
};

const getFullScreenBounds = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const fullScreenBounds = {
    x: 0,
    // Account for notch on arm64 mac with simple fullscreen.
    y: useSimpleFullscreen ? 0 - getMenubarHeight() : 0,
    width,
    height: useSimpleFullscreen ? height + getMenubarHeight() : height,
  };

  return fullScreenBounds;
};

export const fullScreenWindow = (window: BrowserWindow) => {
  const fullScreenBounds = getFullScreenBounds();
  window.setBounds(fullScreenBounds);
  window.setFullScreen(true);
  if (useSimpleFullscreen) window.setSimpleFullScreen(true);
  window.webContents.send('set-fullscreen', true);
  window.webContents.send('use-custom-titlebar', useSimpleFullscreen);
};

export const windowWindow = (window: BrowserWindow) => {
  const windowedBounds = getWindowedBounds();

  window.setFullScreen(false);
  if (useSimpleFullscreen) window.setSimpleFullScreen(false);
  window.setBounds(windowedBounds);
  window.center();
  window.webContents.send('set-fullscreen', false);
  window.webContents.send('use-custom-titlebar', useSimpleFullscreen);
};

export const toggleFullScreen = (window: BrowserWindow) => {
  if (
    window.isFullScreen() ||
    (useSimpleFullscreen && window.isSimpleFullScreen())
  ) {
    windowWindow(window);
  } else {
    fullScreenWindow(window);
  }
};

const registerListeners = (
  mainWindow: BrowserWindow,
  mouseWindow: BrowserWindow
) => {
  mainWindow.on('enter-full-screen', () => {
    if (!mainWindow) return;
    if (mainWindow.isDestroyed()) return;

    mainWindow.webContents.send('set-fullscreen', true);
    mainWindow.setMenuBarVisibility(false);

    mouseWindow.setAlwaysOnTop(true, 'screen-saver');
  });

  mainWindow.on('leave-full-screen', () => {
    if (!mainWindow) return;
    if (mainWindow.isDestroyed()) return;

    mainWindow.webContents.send('set-fullscreen', false);
    mainWindow.setMenuBarVisibility(true);

    mouseWindow.setAlwaysOnTop(false);
  });

  mainWindow.on('focus', () => {
    if (!mainWindow) return;
    if (mainWindow.isDestroyed()) return;

    mouseWindow.moveTop();
  });

  ipcMain.removeHandler('set-fullscreen');
  ipcMain.removeHandler('should-use-custom-titlebar');

  ipcMain.handle('set-fullscreen', (_, shouldFullScreen) => {
    if (shouldFullScreen) {
      fullScreenWindow(mainWindow);
    } else {
      windowWindow(mainWindow);
    }
  });

  ipcMain.handle('should-use-custom-titlebar', () => {
    return useSimpleFullscreen;
  });
};

export const FullScreenHelper = { registerListeners };
