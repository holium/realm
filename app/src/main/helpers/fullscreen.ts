import { BrowserWindow, ipcMain, screen } from 'electron';

import { isArm64Mac } from './env';

// Get the menu bar of new macs with notch.
const getMenubarHeight = () => {
  return (
    screen.getPrimaryDisplay().bounds.height -
    screen.getPrimaryDisplay().workAreaSize.height
  );
};

// ready-to-show is caused to be fired more than once by webviews,
// so we need to check if it's already been expanded from 0,0.
export const hasBeenExpanded = (window: BrowserWindow) => {
  const { width, height } = window.getBounds();
  // On Windows, windows can't be 0,0.
  return width > 200 && height > 50;
};

export const getWindowedBounds = () => {
  const scaleFactor = screen.getPrimaryDisplay().scaleFactor;
  const width = 700 * (scaleFactor > 0 ? scaleFactor : 1);
  const height = 500 * (scaleFactor > 0 ? scaleFactor : 1);
  // Center the window.
  const x = Math.round(
    (screen.getPrimaryDisplay().workAreaSize.width - width) / 2
  );
  const y = Math.round(
    (screen.getPrimaryDisplay().workAreaSize.height - height) / 2
  );

  const windowedBounds = { x, y, width, height };

  return windowedBounds;
};

const getFullScreenBounds = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const fullScreenBounds = {
    x: 0,
    // Account for notch on arm64 mac with simple fullscreen.
    y: isArm64Mac ? 0 - getMenubarHeight() : 0,
    width,
    height: isArm64Mac ? height + getMenubarHeight() : height,
  };

  return fullScreenBounds;
};

export const fullScreenWindow = (window: BrowserWindow) => {
  const fullScreenBounds = getFullScreenBounds();
  window.setBounds(fullScreenBounds);
  if (isArm64Mac) window.setSimpleFullScreen(true);
  else window.setFullScreen(true);
  window.webContents.send('set-fullscreen', true);
  window.webContents.send('use-custom-titlebar', isArm64Mac);
};

export const windowWindow = (window: BrowserWindow) => {
  const windowedBounds = getWindowedBounds();

  window.setFullScreen(false);
  if (isArm64Mac) window.setSimpleFullScreen(false);
  window.setBounds(windowedBounds);
  window.webContents.send('set-fullscreen', false);
  window.webContents.send('use-custom-titlebar', isArm64Mac);
};

export const toggleFullScreen = (window: BrowserWindow) => {
  if (window.isFullScreen() || (isArm64Mac && window.isSimpleFullScreen())) {
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
    return isArm64Mac;
  });
};

export const FullScreenHelper = { registerListeners };
