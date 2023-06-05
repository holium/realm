import { BrowserWindow, ipcMain } from 'electron';

const registerListeners = (
  mainWindow: BrowserWindow,
  mouseWindow: BrowserWindow
) => {
  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('set-fullscreen', true);
    mainWindow.setMenuBarVisibility(false);
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('set-fullscreen', false);
    mainWindow.setMenuBarVisibility(true);
  });

  ipcMain.handle('set-fullscreen', (_, isFullscreen) => {
    mainWindow.setFullScreen(isFullscreen);
  });

  mainWindow.on('focus', mouseWindow.moveTop);
};

export const FullScreenHelper = { registerListeners };
