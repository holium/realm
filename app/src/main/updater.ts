const fs = require('fs');
import path from 'path';
import { app, ipcMain, BrowserWindow, dialog, net } from 'electron';
import log from 'electron-log';

import { autoUpdater } from 'electron-updater';

import { resolveHtmlPath } from './util';

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

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
  private doneCallback: undefined | ((value: unknown) => void) = undefined;
  private ui: BrowserWindow | null = null;
  private wait: BrowserWindow | null = null;

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
      channel: determineReleaseChannel(),
    });
    autoUpdater.on('error', (error) => {
      dialog.showErrorBox(
        'Error: ',
        error == null ? 'unknown' : (error.stack || error).toString()
      );
    });
    autoUpdater.on('checking-for-update', async () => {
      if (self.manualCheck) {
        self.ui?.show();
      }
    });
    autoUpdater.on('update-available', () => {
      console.log('update-available received');
      self.ui?.show();
      self.ui?.webContents.send('auto-updater-message', {
        name: 'update-available',
      });
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
      console.log('update-downloaded');
      self.ui &&
        self.ui.webContents.send('auto-updater-message', {
          name: 'update-downloaded',
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
  }

  startUpdateUI = (manualCheck: boolean = false) => {
    const self = this;
    // show a splash on startup (manual check or not)
    self.wait = new BrowserWindow({
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
      <div style="font-family: Arial; width: 100%; height: calc(100vh); display: flex; align-items: center; justify-content: center;">
        Initializing. Please wait...
      </div>
    `;
    self.wait.loadURL(`data:text/html;charset=utf-8,${content}`);
    // create this window hidden. only show if manual check or updates found
    this.ui = new BrowserWindow({
      show: false,
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
        // devTools: false,
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
      if (manualCheck) {
        self.ui?.show();
        self.wait?.hide();
      }
      self.manualCheck = manualCheck;
      ipcMain.handle('download-updates', () => {
        console.log('download-updates');
        if (self.ui) {
          self.ui.webContents.send('update-status', {
            name: 'starting-download',
          });
        }
        autoUpdater.downloadUpdate();
      });
      ipcMain.handle('cancel-updates', () => {
        console.log('cancel-updates');
        self.ui && self.ui.close();
        self.doneCallback && self.doneCallback('continue');
      });
      ipcMain.handle('install-updates', () => {
        console.log('install-updates');
        if (self.ui) {
          self.ui.webContents.send('update-status', {
            name: 'installing-updates',
          });
        }
        setImmediate(() => autoUpdater.quitAndInstall());
      });
      autoUpdater
        .checkForUpdates()
        .catch((e) => {
          console.log(e);
        })
        .finally(() => (self.manualCheck = false));
    });
    this.ui.loadURL(resolveHtmlPath('updater.html'));
  };

  // for manual update checks, report errors on internet connectivity. for
  //   auto update checks, gracefully ignore.
  checkForUpdates = (manualCheck: boolean = false) => {
    const self = this;
    return new Promise(async (resolve) => {
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
  };
}
