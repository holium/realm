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

  mainWindow.on('focus', mouseWindow.moveTop);

  ipcMain.removeHandler('set-fullscreen');
  ipcMain.removeHandler('is-fullscreen');

  ipcMain.handle('set-fullscreen', (_, isFullscreen) => {
    mainWindow.setFullScreen(isFullscreen);
  });

  ipcMain.handle('is-fullscreen', () => {
    return mainWindow.isFullScreen();
  });
};

export const FullScreenHelper = { registerListeners };
