import { BrowserWindow, ipcMain } from 'electron';

import { bootRealm, bootStandaloneChat } from '../main';

const registerListeners = () => {
  ipcMain.removeHandler('set-standalone-chat');
  ipcMain.removeHandler('is-standalone-chat');

  ipcMain.handle('set-standalone-chat', (_, isStandaloneChat) => {
    // Create a throwaway window so the main process remains open.
    const throwawayWindow = new BrowserWindow({
      show: false,
    });

    if (isStandaloneChat) {
      bootStandaloneChat();
    } else {
      bootRealm();
    }

    throwawayWindow.close();
  });

  ipcMain.handle('is-standalone-chat', () => {
    // Is standalone if one of the windows has the title 'Realm Chat'
    return BrowserWindow.getAllWindows().some(
      (window) => window.getTitle() === 'Realm Chat'
    );
  });
};

export const StandaloneHelper = { registerListeners };
