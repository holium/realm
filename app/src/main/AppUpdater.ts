/*****
 *
 * NOTE: nearly impossible to test in development mode. see here:
 *   https://github.com/electron-userland/electron-builder/issues/1505
 *
 *****************/
import path from 'path';
import { app, ipcMain, BrowserWindow, dialog, net } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { resolveHtmlPath } from './util';
import { isDevelopment } from './helpers/env';
const fs = require('fs');

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

log.transports.file.level = isDevelopment ? 'debug' : 'info';

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
  checkForUpdates: (mainWindow: BrowserWindow, manualCheck: boolean) => void;
}

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
  app.getVersion = () => process.env.AUTOUPDATE_CURRENT_VERSION || '0.1.0';
}

interface IpcHandler {
  channel: string;
  listener: () => void;
}

export class AppUpdater implements IAppUpdater {
  private manualCheck: boolean = false;
  private doneCallback: undefined | ((value: unknown) => void) = undefined;
  private progressWindow: BrowserWindow | null = null;
  private splashWindow: BrowserWindow | null = null;
  private handlers: IpcHandler[] = [];

  constructor() {
    if (!process.env.AUTOUPDATE_FEED_URL) return;
    const self = this;
    // good luck trying to test on localmachine
    if (isDevelopment) {
      autoUpdater.updateConfigPath = path.join(
        __dirname,
        'dev-app-update.json'
      );
    }
    // autoUpdater.autoInstallOnAppQuit = true;
    // must force this set or 'rename' operations post-download will fail
    autoUpdater.autoDownload = false;
    // proxy private github repo requests
    autoUpdater.setFeedURL({
      provider: 'generic',
      // see the app/src/renderer/system/updater/readme.md for more information
      url: process.env.AUTOUPDATE_FEED_URL,
      channel: determineReleaseChannel(),
    });
    autoUpdater.on('error', (error) => {
      self.progressWindow?.webContents.send('auto-updater-message', {
        name: 'error',
        error: error == null ? 'unknown' : (error.stack || error).toString(),
      });
    });
    autoUpdater.on('checking-for-update', async () => {
      if (self.manualCheck) {
        self.progressWindow?.show();
        self.progressWindow?.webContents.send('auto-updater-message', {
          name: 'checking-for-updates',
        });
      }
    });
    autoUpdater.on('update-available', () => {
      self.progressWindow?.show();
      self.splashWindow?.close();
      self.splashWindow = null;
      self.progressWindow?.webContents.send('auto-updater-message', {
        name: 'update-available',
      });
    });
    autoUpdater.on('update-not-available', () => {
      // only show this message if the user chose to run an update check manually
      if (self.manualCheck) {
        self.progressWindow?.webContents.send('auto-updater-message', {
          name: 'update-not-available',
        });
      } else {
        self.done();
      }
    });
    autoUpdater.on('update-downloaded', () => {
      self.progressWindow?.webContents.send('auto-updater-message', {
        name: 'update-downloaded',
      });
    });
    autoUpdater.on('download-progress', (stats) => {
      self.progressWindow?.webContents.send('auto-updater-message', {
        ...stats,
        name: 'update-status',
      });
    });
    autoUpdater.logger = log;
  }

  done = () => {
    this.handlers.forEach((handler) => ipcMain.removeHandler(handler.channel));
    this.splashWindow?.close();
    this.splashWindow = null;
    this.progressWindow?.close();
    this.progressWindow = null;
    this.doneCallback && this.doneCallback('continue');
  };

  startUpdateUI = (
    mainWindow: BrowserWindow | null,
    manualCheck: boolean = false
  ) => {
    const self = this;
    // this is not needed if the app is already open (mainWindow !== null)
    if (!mainWindow) {
      // show a splash on startup (manual check or not)
      self.splashWindow = new BrowserWindow({
        width: 400,
        height: 300,
        icon: getAssetPath('icon.png'),
        title: 'Please wait',
        frame: false,
        center: true,
        resizable: false,
        movable: false,
        webPreferences: {
          devTools: false,
        },
      });
      // must be raw content. any attempt to do stuff with auto generated react/html (see startUpdateUI)
      //  takes a while to load; especially in development when its built on the fly
      const content = `
      <html><body><div style="font-family: Arial; width: 100%; height: calc(100vh); display: flex; align-items: center; justify-content: center;">
        Initializing. Please wait...
      </div></body></html>
    `;
      self.splashWindow?.loadURL(`data:text/html;charset=utf-8,${content}`);
    } else {
      self.splashWindow = null;
    }
    // create this window hidden. only show if manual check or updates found
    // if (!mainWindow) {
    this.progressWindow = new BrowserWindow({
      show: mainWindow ? true : false,
      parent: mainWindow || undefined,
      width: 400,
      height: 300,
      icon: getAssetPath('icon.png'),
      title: 'Update Progress',
      acceptFirstMouse: true,
      fullscreen: false,
      frame: false,
      center: true,
      resizable: false,
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
    this.progressWindow.webContents.on('did-finish-load', () => {
      if (manualCheck) {
        self.progressWindow?.show();
      }
      self.manualCheck = manualCheck;
      self.handlers = [
        {
          channel: 'download-updates',
          listener: () => {
            self.progressWindow?.webContents.send('update-status', {
              name: 'starting-download',
            });
            autoUpdater.downloadUpdate();
          },
        },
        {
          channel: 'cancel-updates',
          listener: () => {
            self.done();
          },
        },
        {
          channel: 'install-updates',
          listener: () => {
            console.log('install-updates');
            self.progressWindow?.webContents.send('update-status', {
              name: 'installing-updates',
            });
            setImmediate(() => autoUpdater.quitAndInstall());
          },
        },
      ];
      self.handlers.forEach((handler) =>
        ipcMain.handle(handler.channel, handler.listener)
      );
      autoUpdater
        .checkForUpdates()
        .catch((e) => {
          console.log(e);
        })
        .finally(() => (self.manualCheck = false));
    });
    this.progressWindow.webContents.loadURL(resolveHtmlPath('updater.html'));
  };

  // for manual update checks, report errors on internet connectivity. for
  //   auto update checks, gracefully ignore.
  checkForUpdates = (
    mainWindow: BrowserWindow | null = null,
    manualCheck: boolean = false
  ) => {
    const self = this;
    return new Promise(async (resolve) => {
      if (!process.env.AUTOUPDATE_FEED_URL) {
        resolve('continue');
        return;
      }
      self.doneCallback = resolve;
      if (net.isOnline()) {
        self.startUpdateUI(mainWindow, manualCheck);
      } else {
        dialog.showMessageBox({
          title: 'Offline',
          message:
            'It appears you do not have internet connectivity. Check your internet connection and try again.',
        });
      }
    });
  };
}
