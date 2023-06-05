import { app, BrowserWindow } from 'electron';

import { RealmService } from '../os/realm.service';
import { AppUpdater } from './AppUpdater';
import {
  createMouseOverlayWindow,
  createRealmWindow,
  createStandaloneChatWindow,
} from './windows';

import './logging';

let updater: AppUpdater;
let realmService: RealmService;

// The main window has a mouse layer associated with it.
// The standalone main window is for booting Realm in a standalone mode.
// It does not have a mouse layer associated with it.
let realmWindow: BrowserWindow | null;
let mouseOverlayWindow: BrowserWindow | null;
let standaloneChatWindow: BrowserWindow | null;

export const bootRealm = () => {
  if (!realmService) {
    realmService = new RealmService();
  }

  if (!realmWindow) {
    realmWindow = createRealmWindow();
  }
  if (!mouseOverlayWindow) {
    mouseOverlayWindow = createMouseOverlayWindow(realmWindow);
  }

  if (standaloneChatWindow) {
    standaloneChatWindow.destroy();
    standaloneChatWindow = null;
  }
};

export const bootStandalone = () => {
  if (!realmService) {
    realmService = new RealmService();
  }

  if (!standaloneChatWindow) {
    standaloneChatWindow = createStandaloneChatWindow();
  }
  if (!mouseOverlayWindow) {
    mouseOverlayWindow = createMouseOverlayWindow(standaloneChatWindow);
  }

  if (realmWindow) {
    realmWindow.destroy();
    realmWindow = null;
  }
  if (mouseOverlayWindow) {
    mouseOverlayWindow.destroy();
    mouseOverlayWindow = null;
  }
};

app
  .whenReady()
  .then(() => {
    updater = new AppUpdater();
    updater.checkingForUpdates = true;
    updater.checkForUpdates().then(() => {
      updater.checkingForUpdates = false;

      bootStandalone();
    });
  })
  .catch(console.error);
