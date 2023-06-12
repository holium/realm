import { app, BrowserWindow } from 'electron';

const registerListeners = (mainWindow: BrowserWindow) => {
  const webContents = mainWindow.webContents;
  webContents.on('will-navigate', (e, url) => {
    if (url !== webContents.getURL()) {
      e.preventDefault();
      webContents.send('realm.browser.open', url);
    }
  });

  // Listen for web contents being created
  app.on(
    'web-contents-created',
    (_event: Electron.Event, webContents: Electron.WebContents) => {
      // Check for a webview
      if (webContents.getType() === 'webview') {
        // Listen for any new window events
        webContents.setWindowOpenHandler(({ url }) => {
          mainWindow.webContents.send('realm.browser.open', url);
          return { action: 'deny' };
        });
      }
    }
  );
};

export const BrowserHelper = { registerListeners };
