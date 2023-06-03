import { BrowserWindow } from 'electron';

const registerListeners = (
  mainWindow: BrowserWindow,
  mouseWindow: BrowserWindow
) => {
  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('set-fullscreen', true);
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('set-fullscreen', false);
  });

  mainWindow.on('focus', mouseWindow.moveTop);
};

export const FullScreenHelper = { registerListeners };
