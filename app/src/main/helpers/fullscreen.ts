import { BrowserWindow } from 'electron';

const registerListeners = (mainWindow: BrowserWindow) => {
  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('set-fullscreen', true);
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('set-fullscreen', false);
  });
};

export const FullScreenHelper = { registerListeners };
