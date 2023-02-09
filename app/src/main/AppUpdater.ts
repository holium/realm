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

/*****
 *
 * NOTE: nearly impossible to test in development mode. see here:
 *   https://github.com/electron-userland/electron-builder/issues/1505
 *
 */

// for now, until we get Windows and Linux auto updating pipelines to fully work,
//  log ALL builds, not just dev or prod
// log.transports.file.level = isDevelopment ? 'debug' : 'info';
log.transports.file.level = 'verbose';
log.verbose(process.env);

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

    if (!process.env.AUTOUPDATE_FEED_URL) return;
    // good luck trying to test on localmachine
    if (isDevelopment) {
      this.autoUpdater.updateConfigPath = path.join(
        __dirname,
        'dev-app-update.json'
      );
      // good ole windows. trying a hack since setFeedURL is not working
    } else if (process.platform === 'win32') {
      const updateConfigPath = `${app.getPath(
        'userData'
      )}/windows-app-update.json`;
      log.verbose(
        `Running on Windows platform. Updating config path to '${updateConfigPath}'...`
      );
      fs.writeFileSync(
        updateConfigPath,
        JSON.stringify({
          provider: 'generic',
          url: process.env.AUTOUPDATE_FEED_URL,
          channel: determineReleaseChannel(),
        })
      );
      this.autoUpdater.updateConfigPath = updateConfigPath;
    } else {
      // proxy private github repo requests
      this.autoUpdater.setFeedURL({
        provider: 'generic',
        // see the app/src/renderer/system/updater/readme.md for more information
        url: process.env.AUTOUPDATE_FEED_URL,
        channel: determineReleaseChannel(),
      });
    }
    // autoUpdater.autoInstallOnAppQuit = true;
    // must force this set or 'rename' operations post-download will fail
    this.autoUpdater.autoDownload = false;
    this.autoUpdater.on('error', (error) => {
      this.progressWindow?.webContents.send('auto-updater-message', {
        name: 'error',
        error: error == null ? 'unknown' : (error.stack || error).toString(),
      });
    });
    this.autoUpdater.on('checking-for-update', async () => {
      this.progressWindow?.webContents.send('auto-updater-message', {
        name: 'checking-for-updates',
        inAppWindow: this.manualCheck,
      });
    });
    this.autoUpdater.on('update-available', (info: UpdateInfo) => {
      console.log('update-available', info);
      this.progressWindow?.show();
      this.splashWindow?.close();
      this.splashWindow = null;
      this.updateInfo = info;
      if (!this.manualCheck) {
        this.progressWindow?.webContents.send('auto-updater-message', {
          name: 'starting-download',
          ...info,
          inAppWindow: this.manualCheck,
        });
        this.autoUpdater.downloadUpdate();
      } else {
        this.progressWindow?.webContents.send('auto-updater-message', {
          name: 'update-available',
          version: info.version,
          inAppWindow: this.manualCheck,
        });
      }
    });
    this.autoUpdater.on('update-not-available', () => {
      if (process.env.NODE_ENV === 'development') {
        this.done();
      }
      // only show this message if the user chose to run an update check manually
      if (this.manualCheck) {
        this.progressWindow?.webContents.send('auto-updater-message', {
          name: 'update-not-available',
          inAppWindow: this.manualCheck,
        });
      } else {
        console.log('update-not-available -> manualCheck');
        this.done();
      }
    });
    this.autoUpdater.on('update-downloaded', () => {
      if (!this.manualCheck) {
        // if (process.env.NODE_ENV === 'development') {
        //   // skips the install and restart for dev mode
        //   this.done();
        // }
        this.progressWindow?.webContents.send('update-status', {
          name: 'installing-updates',
          inAppWindow: this.manualCheck,
        });
        setImmediate(() => this.autoUpdater.quitAndInstall());
      } else {
        console.log('update-downloaded', this.updateInfo);
        this.progressWindow?.webContents.send('auto-updater-message', {
          name: 'update-downloaded',
          inAppWindow: this.manualCheck,
        });
      }
    });
    this.autoUpdater.on('download-progress', (stats) => {
      this.progressWindow?.webContents.send('auto-updater-message', {
        stats,
        info: this.updateInfo,
        name: 'update-status',
        inAppWindow: this.manualCheck,
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
      this.handlers = [
        {
          channel: 'download-updates',
          listener: () => {
            this.progressWindow?.webContents.send('update-status', {
              name: 'starting-download',
              ...this.updateInfo,
              inAppWindow: this.manualCheck,
            });
            this.autoUpdater.downloadUpdate();
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
            this.progressWindow?.webContents.send('update-status', {
              name: 'installing-updates',
            });
            setImmediate(() => this.autoUpdater.quitAndInstall());
          },
        },
      ];
      this.handlers.forEach((handler) => {
        ipcMain.removeHandler(handler.channel);
        ipcMain.handle(handler.channel, handler.listener.bind(this));
      });
      this.autoUpdater.checkForUpdates().catch((error) => {
        console.log(error);
        // this is bad. just show the error without a fancy screen and move on...
        dialog.showErrorBox(
          'Auto Update Error',
          // @ts-ignore
          error == null ? 'unknown' : (error.stack || error).toString()
        );
        // close all the updater windows and continue
        this.done();
      });
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
