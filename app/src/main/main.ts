/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  session,
  screen,
  dialog,
  MessageBoxReturnValue,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import isDev from 'electron-is-dev';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { Realm } from '../os';

import FullscreenHelper from './helpers/fullscreen';
import WebviewHelper from './helpers/webview';
import DevHelper from './helpers/dev';
import MediaHelper from './helpers/media';
import BrowserHelper from './helpers/browser';

// Ad block
import { ElectronBlocker } from '@cliqz/adblocker-electron';
import fetch from 'cross-fetch'; // required 'fetch'

ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
  blocker.enableBlockingInSession(session.fromPartition('browser-webview'));
});

export interface IAppUpdater {
  checkForUpdates: () => void;
}

export class AppUpdater implements IAppUpdater {
  constructor() {
    if (!isDev) {
      autoUpdater.autoInstallOnAppQuit = true;
      autoUpdater.autoDownload = true;
      autoUpdater.on('error', (error) => {
        dialog.showErrorBox(
          'Error: ',
          error == null ? 'unknown' : (error.stack || error).toString()
        );
      });
      autoUpdater.on('update-available', () => {
        dialog
          .showMessageBox({
            type: 'info',
            title: 'Found Updates',
            message: 'Found updates, do you want update now?',
            buttons: ['Sure', 'No'],
          })
          .then((result: MessageBoxReturnValue) => {
            dialog
              .showMessageBox({
                title: 'Button',
                message: `${result.response}`,
              })
              .then(() => {
                // @ts-ignore
                if (result.response === 0) {
                  autoUpdater.downloadUpdate();
                }
              });
          });
      });
      autoUpdater.on('update-not-available', () => {
        dialog.showMessageBox({
          title: 'No Updates',
          message: 'Current version is up-to-date.',
        });
      });
      autoUpdater.on('update-downloaded', () => {
        dialog
          .showMessageBox({
            title: 'Install Updates',
            message:
              'Updates downloaded, application will be quit for update...',
          })
          .then(() => {
            setImmediate(() => autoUpdater.quitAndInstall());
          });
      });
      log.transports.file.level = 'debug';
      autoUpdater.logger = log;
      // autoUpdater.checkForUpdatesAndNotify();
    }
  }
  checkForUpdates = () => {
    if (isDev) return;
    autoUpdater.checkForUpdates();
  };
}

let mainWindow: BrowserWindow | null = null;

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('holium-realm', process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient('holium-realm');
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };
  let factor = screen.getPrimaryDisplay().scaleFactor;

  mainWindow = new BrowserWindow({
    show: false,
    width: 1920 / factor,
    height: 1440 / factor,
    titleBarStyle: 'hidden',
    icon: getAssetPath('icon.png'),
    title: 'Realm',
    acceptFirstMouse: true,
    webPreferences: {
      nodeIntegration: false,
      webviewTag: true,
      allowRunningInsecureContent: false,
      sandbox: false,
      contextIsolation: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.holium/dll/preload.js'),
    },
  });

  // ---------------------------------------------------------------------
  // ----------------------- Start Realm services ------------------------
  // ---------------------------------------------------------------------
  Realm.start(mainWindow);

  // RealmCore.boot(mainWindow);
  FullscreenHelper.registerListeners(mainWindow);
  WebviewHelper.registerListeners(mainWindow);
  DevHelper.registerListeners(mainWindow);
  MediaHelper.registerListeners(mainWindow);
  BrowserHelper.registerListeners(mainWindow);

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.maximize();

  mainWindow.on('resize', () => {
    const newDimension = mainWindow?.getBounds();
    mainWindow?.webContents.send('set-dimensions', newDimension);
    // console.log('dims change: ' + dims);
  });

  // TODO why is this rendering multiple times?
  mainWindow.on('ready-to-show', () => {
    // This is how you can set scale
    mainWindow?.webContents.setZoomFactor(1.0);

    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      isDev ? mainWindow.showInactive() : mainWindow.show();
    }
    mainWindow.webContents.send(
      'realm.shell.set-fullscreen',
      mainWindow.isFullScreen()
    );
    const initialDimensions = mainWindow.getBounds();
    mainWindow.webContents.send('set-dimensions', initialDimensions);
    // console.log('setting dims ready-to-show');
    mainWindow.webContents.send(
      'set-appview-preload',
      app.isPackaged
        ? path.join(__dirname, '../renderer/cursor.preload.js')
        : path.join(app.getAppPath(), 'cursor.preload.js')
    );
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  let appUpdater: any = undefined;
  if (!isDev) {
    appUpdater = new AppUpdater();
  }

  const menuBuilder = new MenuBuilder(mainWindow, appUpdater);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

// start();

/**
 * Add event listeners...
 */
// app.on('web-contents-created', () => {
//   console.log('web-contents-created');
// });
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
