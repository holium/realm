/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, session, ipcMain } from 'electron';
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
import { hideCursor } from './helpers/hideCursor';
import { AppUpdater } from './AppUpdater';
import { isDevelopment, isProduction } from './helpers/env';
import {
  MouseState,
  Vec2,
} from '../../../lib/mouse/src/components/AnimatedCursor';

const fs = require('fs');

ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
  blocker.enableBlockingInSession(session.fromPartition('browser-webview'));
});

// const mouseLibUrl = 'http://localhost:3000'; // For local development.
const mouseLibFile = path.join(
  __dirname,
  '../../../lib/mouse/build/index.html'
);

let mainWindow: BrowserWindow;
let mouseOverlay: BrowserWindow;
const webviews: Record<
  string,
  {
    position: { x: number; y: number };
    hasMouseInside: boolean;
  }
> = {};

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

const getPreload = () =>
  app.isPackaged
    ? path.join(__dirname, 'preload.js')
    : path.join(__dirname, '../../.holium/dll/preload.js');

const createWindow = async () => {
  // TODO fix the warnings and errors with this
  // if (isDevelopment) {
  //   await installExtensions();
  // }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };
  // let factor = screen.getPrimaryDisplay().scaleFactor;

  mainWindow = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1080,
    titleBarStyle: 'hidden',
    icon: getAssetPath('icon.png'),
    title: 'Realm',
    fullscreen: true,
    acceptFirstMouse: true,
    webPreferences: {
      nodeIntegration: false,
      webviewTag: true,
      sandbox: false,
      contextIsolation: true,
      preload: getPreload(),
    },
  });

  // ---------------------------------------------------------------------
  // ----------------------- Start Realm services ------------------------
  // ---------------------------------------------------------------------
  Realm.start(mainWindow);

  FullscreenHelper.registerListeners(mainWindow);
  WebviewHelper.registerListeners(mainWindow);
  DevHelper.registerListeners(mainWindow);
  MediaHelper.registerListeners();
  BrowserHelper.registerListeners(mainWindow);

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.webContents.on('dom-ready', () => {
    hideCursor(mainWindow.webContents);
    mainWindow.webContents.send('add-mouse-listeners', { isInWebview: false });
  });

  mainWindow.webContents.on('will-attach-webview', (_, webPreferences) => {
    webPreferences.preload = getPreload();
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.sandbox = false;
  });

  mainWindow.webContents.on('did-attach-webview', (_, webContents) => {
    webContents.on('dom-ready', () => {
      hideCursor(webContents);
      webContents.send('add-mouse-listeners', { isInWebview: true });
    });
  });

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
    mainWindow.webContents.send(
      'realm.shell.set-fullscreen',
      mainWindow.isFullScreen()
    );
    const initialDimensions = mainWindow.getBounds();
    mainWindow.webContents.send('set-dimensions', initialDimensions);
  });

  // Remove this if your app does not use auto updates
  const appUpdater = new AppUpdater();
  // if (process.env.NODE_ENV === 'production') {
  //   appUpdater = new AppUpdater();
  // }

  const menuBuilder = new MenuBuilder(mainWindow, appUpdater);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

const createMouseOverlay = () => {
  // Create a window covering the whole window.
  const newMouseWindow = new BrowserWindow({
    title: 'Mouse overlay',
    parent: mainWindow,
    ...mainWindow.getBounds(),
    frame: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    resizable: false,
    focusable: false,
    hasShadow: false,
    fullscreenable: false,
    skipTaskbar: true,
    transparent: true,
    alwaysOnTop: true,
    acceptFirstMouse: true,
    webPreferences: {
      sandbox: false,
      devTools: false,
      contextIsolation: true,
      nodeIntegration: false,
      preload: getPreload(),
    },
  });
  newMouseWindow.setIgnoreMouseEvents(true);
  newMouseWindow.loadFile(mouseLibFile);

  newMouseWindow.webContents.on('did-finish-load', () => {
    hideCursor(newMouseWindow.webContents);
  });

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

  mouseOverlay = newMouseWindow;
};

ipcMain.handle(
  'updateWebviewPosition',
  (_, webviewId: string, position: { x: number; y: number }) => {
    console.log('updateWebviewPosition', webviewId, position);
    webviews[webviewId] = { position, hasMouseInside: false };
  }
);

ipcMain.handle('mouseEnteredWebview', (_, id: string) => {
  console.log('mouseEnteredWebview', id);
  webviews[id].hasMouseInside = true;
});

ipcMain.handle('mouseLeftWebview', (_, id: string) => {
  console.log('mouseLeftWebview', id);
  webviews[id].hasMouseInside = false;
});

ipcMain.handle(
  'mouse-move',
  (_, position: Vec2, state: MouseState, isInWebview: boolean) => {
    if (isInWebview) {
      const activeWebviewPosition = Object.values(webviews).find(
        (webview) => webview.hasMouseInside
      )?.position;
      if (!activeWebviewPosition) return;
      const absolutePosition = {
        x: activeWebviewPosition.x + position.x,
        y: activeWebviewPosition.y + position.y,
      };
      mouseOverlay.webContents.send('mouse-move', absolutePosition, state);
    } else {
      mouseOverlay.webContents.send('mouse-move', position, state);
    }
  }
);

ipcMain.handle('mouse-down', () => {
  mouseOverlay.webContents.send('mouse-down');
});

ipcMain.handle('mouse-up', () => {
  mouseOverlay.webContents.send('mouse-up');
});

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
    createMouseOverlay();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) {
        createWindow();
      }
      if (mouseOverlay === null) {
        createMouseOverlay();
      }
    });
  })
  .catch(console.log);
