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
  ipcMain,
  BrowserView,
  session,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import isDev from 'electron-is-dev';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
// import { start as authStart } from '.,./core/auth/manager';
import { RealmCore } from '../core';
// import { start as authStart } from '../core/auth/manager/auth-helper';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
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

  mainWindow = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1440,
    titleBarStyle: 'hidden',
    vibrancy: 'under-window',
    icon: getAssetPath('icon.png'),
    title: 'Realm',
    webPreferences: {
      nodeIntegration: false,
      webviewTag: true,
      // nodeIntegrationInWorker: true,
      contextIsolation: true,
      // additionalArguments: [`storePath:${app.getPath('userData')}`],
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.holium/dll/preload.js'),
    },
  });

  // ---------------------------------------------------------------------
  // ----------------------- Start Realm services ------------------------
  // ---------------------------------------------------------------------
  const realmInstance = RealmCore.boot(mainWindow);

  mainWindow.loadURL(resolveHtmlPath('index.html'));
  mainWindow.maximize();
  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      isDev ? mainWindow.showInactive() : mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  ipcMain.on(
    'open-app',
    async (
      event,
      location: { url: string; cookies: any },
      windowConfig: any
    ) => {
      // console.log(location, windowConfig);
      // let view = new BrowserView({
      //   webPreferences: {
      //     preload: `${__dirname}/preload.js`, // needs full path
      //   },
      // });
      // mainWindow?.removeBrowserView();
      // mainWindow && mainWindow.setBrowserView(view);
      // view.setBounds(windowConfig);
      // mainWindow.
      // console.log(appUrl);
      // session.defaultSession.cookies.set(cookie).then(
      //   () => {
      //     // success
      //   },
      //   (error) => {
      //     console.error(error);
      //   }
      // );
      // session.defaultSession.cookies.set(location.cookies).then(
      //   () => {
      //     // success
      //     event.reply('open-app', { status: 'success' });
      //   },
      //   (error) => {
      //     console.error(error);
      //   }
      // );
      session.fromPartition('app-view').cookies.set(location.cookies);
      // await view.webContents.session.cookies.set(location.cookies);
      // view.webContents.loadURL(location.url);
    }
  );

  ipcMain.on('close-app', async (event, location: any) => {
    console.log(location);
    const views = mainWindow!.getBrowserViews();
    console.log(location, views);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

// start();

/**
 * Add event listeners...
 */

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
