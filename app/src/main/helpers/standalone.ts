import { app, BrowserWindow, ipcMain } from 'electron';

const registerListeners = () => {
  ipcMain.handle('set-standalone-chat', (_, isStandaloneChat) => {
    // Restart the app with 'standalone-chat' switch
    app.relaunch({ args: [isStandaloneChat ? '--standalone-chat' : ''] });
    app.exit();
  });

  ipcMain.handle('is-standalone-chat', () => {
    // Is standalone if one of the windows has the title 'Realm Chat'
    return BrowserWindow.getAllWindows().some(
      (window) => window.getTitle() === 'Realm Chat'
    );
  });
};

export const StandaloneHelper = { registerListeners };
