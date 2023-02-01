import { app, dialog, MessageBoxReturnValue, net } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import fs from 'fs';
import { isDevelopment } from './helpers/env';

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
  checkForUpdates: () => void;
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

export class AppUpdater implements IAppUpdater {
  private manualCheck: boolean = false;
  constructor() {
    if (process.env.NODE_ENV === 'development') return;
    // autoUpdater.autoInstallOnAppQuit = true;
    // must force this set or 'rename' operations post-download will fail
    autoUpdater.autoDownload = false;
    // proxy private github repo requests
    autoUpdater.setFeedURL({
      provider: 'custom',
      url: process.env.AUTOUPDATE_FEED_URL,
      channel: determineReleaseChannel(),
    });
    autoUpdater.on('error', (error) => {
      dialog.showErrorBox(
        'Error: ',
        error === null ? 'unknown' : (error.stack || error).toString()
      );
    });
    autoUpdater.on('update-available', () => {
      dialog
        .showMessageBox({
          type: 'info',
          title: 'Found Updates',
          message: 'Found updates, do you want update now?',
          buttons: ['Yes', 'No'],
        })
        .then((result: MessageBoxReturnValue) => {
          // @ts-ignore
          if (result.response === 0) {
            autoUpdater.downloadUpdate();
          }
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
    if (net.isOnline()) {
      autoUpdater.checkForUpdates();
    }
  }

  // for manual update checks, report errors on internet connectivity. for
  //   auto update checks, gracefully ignore.
  checkForUpdates = () => {
    if (process.env.NODE_ENV === 'development') return;
    if (net.isOnline()) {
      this.manualCheck = true;
      autoUpdater.checkForUpdates().finally(() => (this.manualCheck = false));
    } else {
      dialog.showMessageBox({
        title: 'Offline',
        message:
          'It appears you do not have internet connectivity. Check your internet connection and try again.',
      });
    }
  };
}
