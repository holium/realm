/*****
 *
 * NOTE: nearly impossible to test in development mode. see here:
 *   https://github.com/electron-userland/electron-builder/issues/1505
 *
 *****************/
import path from 'path';
import { app, ipcMain, BrowserWindow, dialog, net } from 'electron';
import log from 'electron-log';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import { resolveUpdaterPath, resolveHtmlPath } from './util';
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
  private updateInfo: UpdateInfo | undefined = undefined;
  private autoUpdater: typeof autoUpdater;

  constructor() {
    autoUpdater.removeAllListeners();
    this.autoUpdater = autoUpdater;
    this.done = this.done.bind(this);
    this.startUpdateUI = this.startUpdateUI.bind(this);
    if (!process.env.AUTOUPDATE_FEED_URL) return;
    // good luck trying to test on localmachine
    if (isDevelopment) {
      this.autoUpdater.updateConfigPath = path.join(
        __dirname,
        'dev-app-update.json'
      );
    }
    console.log('contructor -> autoUpdater.autoDownload = false');
    // autoUpdater.autoInstallOnAppQuit = true;
    // must force this set or 'rename' operations post-download will fail
    this.autoUpdater.autoDownload = false;
    // proxy private github repo requests
    this.autoUpdater.setFeedURL({
      provider: 'generic',
      // see the app/src/renderer/system/updater/readme.md for more information
      url: process.env.AUTOUPDATE_FEED_URL,
      channel: determineReleaseChannel(),
    });
    this.autoUpdater.on('error', (error) => {
      this.progressWindow?.webContents.send('auto-updater-message', {
        name: 'error',
        error: error == null ? 'unknown' : (error.stack || error).toString(),
      });
    });
    this.autoUpdater.on('checking-for-update', async () => {
      this.progressWindow?.webContents.send('auto-updater-message', {
        name: 'checking-for-updates',
      });
    });
    this.autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.splashWindow?.close();
      this.splashWindow = null;
      this.updateInfo = info;
      if (!this.manualCheck) {
        console.log('update-available -> autoDownload');
        this.progressWindow?.webContents.send('auto-updater-message', {
          name: 'starting-download',
          ...info,
        });
        this.autoUpdater.downloadUpdate();
      } else {
        console.log('update-available -> manualCheck');
        this.progressWindow?.webContents.send('auto-updater-message', {
          name: 'update-available',
          version: info.version,
        });
      }
    });
    this.autoUpdater.on('update-not-available', () => {
      // only show this message if the user chose to run an update check manually
      if (this.manualCheck) {
        this.progressWindow?.webContents.send('auto-updater-message', {
          name: 'update-not-available',
        });
      } else {
        console.log('update-not-available -> manualCheck');
        this.done();
      }
    });
    this.autoUpdater.on('update-downloaded', () => {
      console.log('update-downloaded -> manualCheck=', this.manualCheck);
      if (!this.manualCheck) {
        if (process.env.NODE_ENV === 'development') {
          this.done();
        } else {
          this.progressWindow?.webContents.send('update-status', {
            name: 'installing-updates',
          });
          setImmediate(() => this.autoUpdater.quitAndInstall());
        }
      } else {
        this.progressWindow?.webContents.send('auto-updater-message', {
          name: 'update-downloaded',
        });
      }
    });
    this.autoUpdater.on('download-progress', (stats) => {
      this.progressWindow?.webContents.send('auto-updater-message', {
        stats,
        info: this.updateInfo,
        name: 'update-status',
      });
    });
    this.autoUpdater.logger = log;
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
    console.log('startUpdateUI', manualCheck);
    this.manualCheck = manualCheck;
    // this is not needed if the app is already open (mainWindow !== null)
    if (!mainWindow) {
      // show a splash on startup (manual check or not)
      this.splashWindow = new BrowserWindow({
        width: 420,
        height: 310,
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
      this.splashWindow.loadURL(resolveUpdaterPath('initial.html'));
    } else {
      this.splashWindow = null;
    }
    // create this window hidden. only show if manual check or updates found
    // if (!mainWindow) {
    this.progressWindow = new BrowserWindow({
      show: mainWindow ? true : false,
      parent: mainWindow || undefined,
      width: 420,
      height: 310,
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
        sandbox: false,
        contextIsolation: true,
        preload: app.isPackaged
          ? path.join(__dirname, 'updater.js')
          : path.join(__dirname, '../../.holium/dll/updater.js'),
      },
    });
    this.progressWindow.webContents.on('did-finish-load', () => {
      console.log('did-finish-load ---> manualCheck = ', this.manualCheck);
      // if (manualCheck) {
      //   this.progressWindow?.show();
      // }
      this.handlers = [
        {
          channel: 'download-updates',
          listener: () => {
            console.log('download-updates');
            // this.progressWindow?.webContents.send('update-status', {
            //   name: 'starting-download',
            //   ...this.updateInfo,
            // });
            // this.autoUpdater.downloadUpdate();
          },
        },
        {
          channel: 'cancel-updates',
          listener: () => {
            this.done();
          },
        },
        {
          channel: 'install-updates',
          listener: () => {
            console.log('install-updates');
            // this.progressWindow?.webContents.send('update-status', {
            //   name: 'installing-updates',
            // });
            // setImmediate(() => this.autoUpdater.quitAndInstall());
          },
        },
      ];
      this.handlers.forEach((handler) => {
        ipcMain.removeHandler(handler.channel);
        console.log(handler.channel, `manualCheck=${this.manualCheck}`);
        ipcMain.handle(handler.channel, handler.listener.bind(this));
      });
      this.autoUpdater.checkForUpdates().catch((e) => {
        console.log(e);
      });
      // if (!this.manualCheck) {
      // } else {
      //   this.progressWindow?.webContents.send('auto-updater-message', {
      //     name: 'checking-for-updates',
      //     info: this.updateInfo,
      //   });
      // }
      // .finally(() => (this.manualCheck = false));
    });
    this.progressWindow.webContents.loadURL(resolveHtmlPath('updater.html'));
  };

  // for manual update checks, report errors on internet connectivity. for
  //   auto update checks, gracefully ignore.
  checkForUpdates = (
    mainWindow: BrowserWindow | null = null,
    manualCheck: boolean = false
  ) => {
    return new Promise(async (resolve) => {
      if (!process.env.AUTOUPDATE_FEED_URL) {
        resolve('continue');
        return;
      }
      this.doneCallback = resolve;
      if (net.isOnline()) {
        console.log('checkForUpdates ->>>>>>>>>>>', manualCheck);
        this.startUpdateUI(mainWindow, manualCheck);
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
