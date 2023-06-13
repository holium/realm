import { app, BrowserWindow } from 'electron';
import log from 'electron-log';

const registerListeners = (mainWindow: BrowserWindow) => {
  // Deep linked url
  let deeplinkingUrl: string | null = null;

  if (!app.isDefaultProtocolClient('realm')) {
    // Define custom protocol handler. Deep linking works on packaged versions of the application!
    app.setAsDefaultProtocolClient('realm');
  }

  // Protocol handler for osx
  app.on('open-url', function (event: any, url: string) {
    if (mainWindow.isDestroyed()) return;

    event.preventDefault();
    deeplinkingUrl = url;

    const spacePath = getSpacePath(deeplinkingUrl);
    if (spacePath) mainWindow.webContents.send('join-space', spacePath);

    // LOG
    console.log('open-url');
    log.info('open-url', spacePath);
  });

  const getSpacePath = (queryParam: string | null) => {
    return queryParam?.split('join-')[1];
  };
};

export const DeepLinkHelper = { registerListeners };
