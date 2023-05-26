import { BrowserWindow } from 'electron';

const registerListeners = (app: any, mainWindow: BrowserWindow) => {
  // Deep linked url
  let deeplinkingUrl: string | null = null;

  // Force Single Instance Application
  const gotTheLock = app.requestSingleInstanceLock();
  if (gotTheLock) {
    app.on('second-instance', (_: any, argv: string) => {
      // Someone tried to run a second instance, we should focus our window.

      // Protocol handler for win32
      // argv: An array of the second instance’s (command line / deep linked) arguments
      if (process.platform === 'win32') {
        // Keep only command line / deep linked arguments
        deeplinkingUrl = argv.slice(1);
      }
      logEverywhere('app.makeSingleInstance# ' + deeplinkingUrl);

      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
  } else {
    app.quit();
    return;
  }

  if (!app.isDefaultProtocolClient('realm')) {
    // Define custom protocol handler. Deep linking works on packaged versions of the application!
    app.setAsDefaultProtocolClient('realm');
  }

  app.on('will-finish-launching', function () {
    // Protocol handler for osx
    app.on('open-url', function (event: any, url: string) {
      event.preventDefault();
      deeplinkingUrl = url;
      logEverywhere('open-url# ' + deeplinkingUrl);
    });
  });

  // Log both at dev console and at running node console instance
  function logEverywhere(s: string) {
    console.log(s);
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.executeJavaScript(`console.log("${s}")`);
    }
  }
};

export const DeepLinkHelper = { registerListeners };
