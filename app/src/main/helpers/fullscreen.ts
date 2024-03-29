import { BrowserWindow, ipcMain, screen } from 'electron';

import { RealmService } from '../../os/realm.service';
import { isMacWithCameraNotch } from './env';

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
  const hasCameraNotch = isMacWithCameraNotch();

  const fullScreenBounds = {
    x: 0,
    // Account for notch on arm64 mac with simple fullscreen.
    y: hasCameraNotch ? 0 - getMenubarHeight() : 0,
    width,
    height: hasCameraNotch ? height + getMenubarHeight() : height,
  };

  return fullScreenBounds;
};

export const fullScreenWindow = (
  window: BrowserWindow,
  realmService: RealmService | null
) => {
  const fullScreenBounds = getFullScreenBounds();
  window.setBounds(fullScreenBounds);

  const hasCameraNotch = isMacWithCameraNotch();
  if (hasCameraNotch) window.setSimpleFullScreen(true);
  else window.setFullScreen(true);
  window.webContents.send('set-fullscreen', true);
  window.webContents.send('use-custom-titlebar', hasCameraNotch);
  realmService?.setLastWindowBounds(fullScreenBounds);
};

export const windowWindow = (
  window: BrowserWindow,
  realmService: RealmService | null
) => {
  const windowedBounds = getWindowedBounds();

  window.setFullScreen(false);

  const hasCameraNotch = isMacWithCameraNotch();
  if (hasCameraNotch) window.setSimpleFullScreen(false);
  window.setBounds(windowedBounds);
  window.webContents.send('set-fullscreen', false);
  window.webContents.send('use-custom-titlebar', hasCameraNotch);
  realmService?.setLastWindowBounds(windowedBounds);
};

let rs: any;
export const toggleFullScreen = (window: BrowserWindow) => {
  const hasCameraNotch = isMacWithCameraNotch();

  if (
    window.isFullScreen() ||
    (hasCameraNotch && window.isSimpleFullScreen())
  ) {
    windowWindow(window, rs);
  } else {
    fullScreenWindow(window, rs);
  }
};

const registerListeners = (
  mainWindow: BrowserWindow,
  mouseWindow: BrowserWindow,
  realmService: RealmService | null
) => {
  rs = realmService;
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
      fullScreenWindow(mainWindow, realmService);
    } else {
      windowWindow(mainWindow, realmService);
    }
  });

  ipcMain.handle('should-use-custom-titlebar', () => {
    return isMacWithCameraNotch();
  });
};

export const FullScreenHelper = { registerListeners };
