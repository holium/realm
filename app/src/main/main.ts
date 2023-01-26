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
  BrowserView,
  shell,
  session,
  dialog,
  MessageBoxReturnValue,
  net,
  Menu,
  ipcMain,
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
import { reject } from 'lodash';
import ViewCode from 'renderer/system/onboarding/ViewCode.dialog';
import { setFdLimit } from 'process';

const fs = require('fs');

ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
  blocker.enableBlockingInSession(session.fromPartition('browser-webview'));
});

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

// a note on isOnline...
//  from this: https://www.electronjs.org/docs/latest/api/net#netisonline
// "A return value of false is a pretty strong indicator that the user won't
//  be able to connect to remote sites. However, a return value of true is
//  inconclusive; even if some link is up, it is uncertain whether a particular
//  connection attempt to a particular remote site will be successful."
//
//  so it appears there is not 100% guarantee the checkForUpdates will successfully
//    connect, even if isOnline is true. something to keep in mind.
export interface IAppUpdater {
  checkForUpdates: (manualCheck: boolean) => void;
}

log.transports.file.level = isDevelopment ? 'debug' : 'info';

// determine the releaseChannel. if a user downloads an alpha version of the app, we
//  need to record this for later use. the reason is that 'alpha' channel updates
//  both when new alpha and release builds are deployed.
//  since release builds will not have process.env.RELEASE_CHANNEL (which means)
//   channel will be set to 'latest', we need to "remember" that this is still
//   an 'alpha' channel user. the rule is:
//  once an 'alpha' user, always an 'alpha' user unless you remove/edit the settings.json file
const determineReleaseChannel = () => {
  let releaseChannel = process.env.RELEASE_CHANNEL || 'latest';
  const settingsFilename = `${app.getPath('userData')}/settings.json`;
  if (fs.existsSync(settingsFilename)) {
    var settings = JSON.parse(fs.readFileSync(settingsFilename, 'utf8'));
    releaseChannel = settings.releaseChannel || releaseChannel;
  } else {
    if (releaseChannel === 'alpha') {
      fs.writeFileSync(settingsFilename, JSON.stringify({ releaseChannel }));
    }
  }
  return releaseChannel;
};

// to properly test auto update in development, see:
//  https://github.com/SimulatedGREG/electron-vue/issues/375#issuecomment-388873561
if (process.env.NODE_ENV === 'development') {
  // set the version to whatever value is needed so that this version (semver)
  //  is "less than" the version found on the update server
  app.getVersion = () => '0.1.11-alpha';
}

export class AppUpdater implements IAppUpdater {
  private manualCheck: boolean = false;
  private updatesAvailable: boolean = false;
  private doneCallback: undefined | ((value: unknown) => void) = undefined;
  private ui: BrowserWindow | null = null;
  // private updatesAvailable: boolean = false;

  constructor() {
    const self = this;
    // if (process.env.NODE_ENV === 'development') return;
    // autoUpdater.autoInstallOnAppQuit = true;
    // must force this set or 'rename' operations post-download will fail
    autoUpdater.autoDownload = false;
    // proxy private github repo requests
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: 'http://localhost:3001',
      channel: 'alpha',
    });
    autoUpdater.on('error', (error) => {
      dialog.showErrorBox(
        'Error: ',
        error == null ? 'unknown' : (error.stack || error).toString()
      );
    });
    autoUpdater.on('checking-for-update', async () => {
      if (self.manualCheck) {
        // self.ui?.show();
      }
    });
    autoUpdater.on('update-available', () => {
      console.log('update-available received');
      self.ui?.webContents.send('auto-updater-message', {
        name: 'update-available',
      });
      // dialog
      //   .showMessageBox({
      //     type: 'info',
      //     title: 'Found Updates',
      //     message: 'Found updates, do you want update now?',
      //     buttons: ['Yes', 'No'],
      //   })
      //   .then((result: MessageBoxReturnValue) => {
      //     // @ts-ignore
      //     if (result.response === 0) {
      //       // autoUpdater.downloadUpdate();
      //     } else {
      //       self.doneCallback && self.doneCallback('continue');
      //     }
      //   });
    });
    autoUpdater.on('update-not-available', () => {
      // only show this message if the user chose to run an update check manually
      if (this.manualCheck) {
        dialog.showMessageBox({
          title: 'No Updates',
          message: 'Current version is up-to-date.',
        });
      }
      self.doneCallback && self.doneCallback('continue');
    });
    autoUpdater.on('update-downloaded', () => {
      dialog
        .showMessageBox({
          title: 'Install Updates',
          message: 'Updates downloaded, application will be quit for update...',
        })
        .then(() => {
          setImmediate(() => autoUpdater.quitAndInstall());
        });
    });
    autoUpdater.on('download-progress', (stats) => {
      console.log('download-progress => %o', stats);
      self.ui &&
        self.ui.webContents.send('auto-updater-message', {
          ...stats,
          name: 'update-status',
        });
    });
    autoUpdater.logger = log;
    // run auto check once every 10 minutes after app starts
    // setInterval(() => {
    //   if (!this.manualCheck) {
    //     // gracefully ignore if no internet when attempting to auto update
    //     if (net.isOnline()) {
    //       autoUpdater.checkForUpdates();
    //     }
    //   }
    // }, 600000);
    // gracefully ignore if no internet when attempting to auto update
    // if (net.isOnline()) {
    //   autoUpdater.checkForUpdates();
    // }
  }

  startUpdateUI = (manualCheck: boolean = false) => {
    const self = this;
    this.ui = new BrowserWindow({
      //show: false,
      // parent: mainWindow || undefined,
      width: 400,
      height: 300,
      icon: getAssetPath('icon.png'),
      title: 'Update Progress',
      acceptFirstMouse: true,
      frame: false,
      center: true,
      resizable: true,
      movable: false,
      webPreferences: {
        devTools: false,
        nodeIntegration: false,
        webviewTag: true,
        sandbox: false,
        contextIsolation: true,
        preload: app.isPackaged
          ? path.join(__dirname, 'updater.js')
          : path.join(__dirname, '../../.holium/dll/updater.js'),
      },
    });
    this.ui.webContents.on('did-finish-load', () => {
      self.manualCheck = manualCheck;
      ipcMain.handle('install-updates', () => {
        if (self.ui) {
          self.ui.webContents.send('update-status', {
            name: 'starting-download',
          });
        }
        autoUpdater.downloadUpdate();
      });
      ipcMain.handle('cancel-updates', () => {
        self.ui && self.ui.close();
        self.doneCallback && self.doneCallback('continue');
      });
      autoUpdater
        .checkForUpdates()
        .catch((e) => {
          console.log(e);
          reject(e);
        })
        .finally(() => (self.manualCheck = false));
    });
    this.ui.loadURL(resolveHtmlPath('progress.html'));
  };

  // for manual update checks, report errors on internet connectivity. for
  //   auto update checks, gracefully ignore.
  checkForUpdates = (manualCheck: boolean = false) => {
    const self = this;
    return new Promise(async (resolve, reject) => {
      self.doneCallback = resolve;
      if (net.isOnline()) {
        self.startUpdateUI(manualCheck);
      } else {
        dialog.showMessageBox({
          title: 'Offline',
          message:
            'It appears you do not have internet connectivity. Check your internet connection and try again.',
        });
      }
    });
    // return new Promise((resolve, reject) => {
    //   // if (process.env.NODE_ENV === 'development') return;
    //   if (net.isOnline()) {
    //     this.manualCheck = true;
    //     autoUpdater
    //       .checkForUpdates()
    //       .then((val) => {
    //         resolve(val);
    //       })
    //       .catch((e) => {
    //         console.log(e);
    //         reject(e);
    //       })
    //       .finally(() => {
    //         this.manualCheck = false;
    //       });
    //   } else {
    //     dialog.showMessageBox({
    //       title: 'Offline',
    //       message:
    //         'It appears you do not have internet connectivity. Check your internet connection and try again.',
    //     });
    //   }
    // });
  };
}

const appUpdater = new AppUpdater();

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

process.on('uncaughtException', (err) => {
  try {
    fs.appendFileSync('realmlog.txt', err.stack || err.message);
  } catch (e) {
    console.log(e);
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

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

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const createWindow = async () => {
  // TODO fix the warnings and errors with this
  // if (isDevelopment) {
  //   await installExtensions();
  // }

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
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.holium/dll/preload.js'),
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

  mainWindow.on('resize', () => {
    const newDimension = mainWindow?.getBounds();
    mainWindow?.webContents.send('set-dimensions', newDimension);
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
  .then(async () => {
    console.log('checking for updates...');
    appUpdater.checkForUpdates().then((result: unknown) => {
      //   console.log('after checkForUpdates => %o', result);
      createWindow();
    });
    app.on('activate', async () => {
      console.log('activated');
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) {
        createWindow();
      }
    });
  })
  .catch(console.log);
