/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, ipcMain, session, shell } from 'electron';
import { download } from 'electron-dl';
import isDev from 'electron-is-dev';
import log from 'electron-log';
import { ElectronBlocker } from '@cliqz/adblocker-electron';
import fs from 'fs';
import path from 'path';

import { RealmService } from '../os/realm.service';
import { AppUpdater } from './AppUpdater';
import { BrowserHelper } from './helpers/browser';
import { CursorHelper } from './helpers/cursor';
import { DeepLinkHelper } from './helpers/deepLink';
import { DevHelper } from './helpers/dev';
import { isArm64, isDevelopment, isMac, isProduction } from './helpers/env';
import { FullScreenHelper } from './helpers/fullscreen';
import { KeyHelper } from './helpers/key';
import { MediaHelper } from './helpers/media';
import { MouseHelper } from './helpers/mouse';
import { PowerHelper } from './helpers/power';
import { WebViewHelper } from './helpers/webview';
import { MenuBuilder } from './menu';
import { resolveHtmlPath } from './util';

// TODO test this
log.create('main');
log.catchErrors();
log.transports.file.level = 'info';
log.transports.file.resolvePath = () =>
  path.join(app.getPath('userData'), 'main.log');

ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
  blocker.enableBlockingInSession(session.fromPartition('browser-webview'));
});

let updater: AppUpdater;
let mainWindow: BrowserWindow;

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('holium-realm', process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient('holium-realm');
}

process.on('uncaughtException', (err) => {
  try {
    fs.appendFileSync('realmlog.txt', err.stack || err.message);
  } catch (e) {
    console.log(e);
  }
});

if (isProduction) {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (isDevelopment) require('electron-debug')();

const getAssetPath = (...paths: string[]) =>
  app.isPackaged
    ? path.join(process.resourcesPath, 'assets', ...paths)
    : path.join(__dirname, '../../assets', ...paths);

export const getPreloadPath = () =>
  app.isPackaged
    ? path.join(__dirname, 'preload.js')
    : path.join(__dirname, '../../.holium/dll/preload.js');

export const toggleFullscreen = (mainWindow: BrowserWindow) => {
  if (isArm64 && isMac) {
    const wasSimpleFullscreen = mainWindow.isSimpleFullScreen();
    mainWindow.setSimpleFullScreen(!wasSimpleFullscreen);
    const initialDimensions = mainWindow.getBounds();
    if (wasSimpleFullscreen) {
      mainWindow.webContents.send('set-dimensions', initialDimensions);
      mainWindow.webContents.send('set-fullscreen', false);
    } else {
      initialDimensions.height = initialDimensions.height - 42;
      mainWindow.webContents.send('set-dimensions', initialDimensions);
      mainWindow.webContents.send('set-fullscreen', true);
    }
    // mainWindow.webContents.send('set-titlebar-visible', !wasSimpleFullscreen);
  } else {
    const wasFullscreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!wasFullscreen);
    mainWindow.setMenuBarVisibility(wasFullscreen);
    mainWindow.webContents.send('set-fullscreen', !wasFullscreen);
  }
};

const createWindow = async () => {
  if (isDevelopment) {
    // TODO can cleanup here
  }

  mainWindow = new BrowserWindow({
    show: false,
    frame: isArm64 && isMac ? false : true,
    width: 1512,
    height: 982,
    icon: getAssetPath('icon.png'),
    title: 'Realm',
    fullscreen: true,
    acceptFirstMouse: true,
    // turn on simple fullscreen for arm64 mac to fill notch area
    simpleFullscreen: isArm64 && isMac,
    webPreferences: {
      nodeIntegration: false,
      webviewTag: true,
      sandbox: false,
      contextIsolation: true,
      preload: getPreloadPath(),
    },
  });
  mainWindow.setMenuBarVisibility(false);

  // ---------------------------------------------------------------------
  // ----------------------- Start Realm services ------------------------
  // ---------------------------------------------------------------------
  // Realm.start(mainWindow);
  // ---------------------------------------------------------------------

  // console.log('second-instance');
  // log.info('second-instance', spacePath);

  WebViewHelper.registerListeners(mainWindow);
  DevHelper.registerListeners(mainWindow);
  MediaHelper.registerListeners();
  BrowserHelper.registerListeners(mainWindow);
  PowerHelper.registerListeners(mainWindow);
  KeyHelper.registerListeners(mainWindow);
  DeepLinkHelper.registerListeners(mainWindow);

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.send('add-mouse-listeners', true);
    mainWindow.webContents.send('add-key-listeners');
  });

  ipcMain.handle('close-realm', (_) => {
    mainWindow.close();
    app.quit();
  });
  ipcMain.handle('toggle-minimized', (_) => {
    mainWindow.isMinimized() ? mainWindow.restore() : mainWindow.minimize();
  });

  ipcMain.handle('toggle-fullscreen', (_) => {
    toggleFullscreen(mainWindow);
  });

  // ---------------------------------------------------------------------
  // ----------------------- Start Realm services ------------------------
  // ---------------------------------------------------------------------
  new RealmService();

  // TODO why is this rendering multiple times?
  mainWindow.on('ready-to-show', () => {
    // This is how you can set scale
    mainWindow.webContents.setZoomFactor(1.0);

    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      isDev ? mainWindow.showInactive() : mainWindow.show();
    }
    const initialDimensions = mainWindow.getBounds();
    let hasTitlebar = false;
    let isFullscreen = mainWindow.isFullScreen();
    if (isArm64 && isMac) {
      initialDimensions.height = initialDimensions.height - 42;
      hasTitlebar = true;
      isFullscreen = mainWindow.isSimpleFullScreen();
    }
    mainWindow.webContents.send('set-titlebar-visible', hasTitlebar);
    mainWindow.webContents.send('set-dimensions', initialDimensions);
    mainWindow.webContents.send('set-fullscreen', isFullscreen);
    // mainWindow.on('app-command')
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

const createMouseOverlayWindow = () => {
  // Create a window covering the whole window.
  const bounds = mainWindow.getBounds();
  const newMouseWindow = new BrowserWindow({
    title: 'Mouse overlay',
    parent: mainWindow,
    ...bounds,
    frame: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    resizable: false,
    focusable: false,
    hasShadow: false,
    skipTaskbar: true,
    transparent: true,
    fullscreen: true,
    titleBarStyle: 'hidden',
    acceptFirstMouse: true,
    roundedCorners: false,
    webPreferences: {
      sandbox: false,
      devTools: false,
      contextIsolation: true,
      nodeIntegration: false,
      preload: getPreloadPath(),
    },
  });
  newMouseWindow.setIgnoreMouseEvents(true);
  newMouseWindow.loadURL(resolveHtmlPath('mouse.html'));
  // newMouseWindow.setMenuBarVisibility(false);

  FullScreenHelper.registerListeners(mainWindow, newMouseWindow);
  CursorHelper.registerListeners(mainWindow, newMouseWindow);
  MouseHelper.registerListeners(mainWindow, newMouseWindow);

  newMouseWindow.on('close', () => {
    if (mainWindow.isClosable()) mainWindow.close();
  });

  mainWindow.on('close', () => {
    if (newMouseWindow.isClosable()) newMouseWindow.close();
  });

  mainWindow.on('closed', () => {
    app.quit();
  });

  mainWindow.on('resize', () => {
    const newDimension = mainWindow.getBounds();
    newMouseWindow.setBounds(newDimension);
    mainWindow.webContents.send('set-dimensions', newDimension);
  });
};

app.on('window-all-closed', () => {
  if (!updater.checkingForUpdates) {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (!isMac) app.quit();
    if (isArm64) app.quit();
  }
});
// quitting is complicated. We have to catch the initial quit signal, preventDefault() it,
// do our cleanup, and then re-emit and actually quit it
// let lastQuitSignal: number = 0;
// app.on('before-quit', (event) => {
//   if (!updater.checkingForUpdates) {
//     if (lastQuitSignal === 0) {
//       lastQuitSignal = new Date().getTime() - 1;
//       event.preventDefault();
//       mainWindow.webContents.send('realm.before-quit');
//       setTimeout(() => app.quit(), 500); // after half a second, we really do need to shut down
//     }
//   }
// });

// ipcMain.on('realm.app.quit', (_event) => {
//   if (!updater.checkingForUpdates) app.quit();
// });

ipcMain.on('download-url-as-file', (_event, { url }) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    download(win, url, { saveAs: true });
  }
});

app
  .whenReady()
  .then(() => {
    updater = new AppUpdater();
    updater.checkingForUpdates = true;
    updater.checkForUpdates().then(() => {
      updater.checkingForUpdates = false;
      createWindow();
      createMouseOverlayWindow();
    });
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
        createMouseOverlayWindow();
      }
    });

    app.on('before-quit', () => {
      if (isMac && isArm64) {
        mainWindow?.close();
        app.exit();
      }
    });
  })
  .catch(console.log);
