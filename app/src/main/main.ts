import { app, BrowserWindow, nativeImage } from 'electron';

import { RealmService } from '../os/realm.service';
import { AppUpdater } from './AppUpdater';
import { getAssetPath } from './util';
import {
  createMouseOverlayWindow,
  createRealmWindow,
  createStandaloneChatWindow,
  registerMouseLayerHandlers,
} from './windows';

import './logging';

let updater: AppUpdater;
let realmService: RealmService | null;

// The realm window has a mouse overlay window associated with it.
// The standalone chat window is for booting Realm in a standalone mode
// and does not have a mouse overlay window.
let realmWindow: BrowserWindow | null;
let mouseOverlayWindow: BrowserWindow | null;
let standaloneChatWindow: BrowserWindow | null;

export const bootRealm = () => {
  if (!realmService) {
    realmService = new RealmService();
  }

  if (standaloneChatWindow) {
    standaloneChatWindow.destroy();
    standaloneChatWindow = null;
  }

  if (mouseOverlayWindow) {
    mouseOverlayWindow.destroy();
    mouseOverlayWindow = null;
  }

  realmWindow = createRealmWindow();
  mouseOverlayWindow = createMouseOverlayWindow(realmWindow);

  // Change dock icon to realm icon.
  const realmImage = nativeImage.createFromPath(getAssetPath('icon.png'));
  app.dock.setIcon(realmImage);

  realmWindow.on('close', () => {
    realmWindow = null;
  });

  mouseOverlayWindow.on('close', () => {
    mouseOverlayWindow = null;
  });
};

export const bootStandaloneChat = () => {
  if (!realmService) {
    realmService = new RealmService();
  }

  if (realmWindow && realmWindow.isClosable()) {
    realmWindow.close();
    realmWindow = null;
  }

  standaloneChatWindow = createStandaloneChatWindow();
  const throwawayWindow = new BrowserWindow({
    show: false,
  });
  registerMouseLayerHandlers(throwawayWindow, standaloneChatWindow);

  // Change dock icon to standalone chat icon.
  const standaloneImage = nativeImage.createFromPath(getAssetPath('uqbar.png'));
  app.dock.setIcon(standaloneImage);

  standaloneChatWindow.on('close', () => {
    standaloneChatWindow = null;
  });
};

app
  .whenReady()
  .then(() => {
    updater = new AppUpdater();
    updater.checkingForUpdates = true;
    updater.checkForUpdates().then(() => {
      updater.checkingForUpdates = false;

      // bootRealm();
      bootStandaloneChat();
    });
  })
  .catch(console.error);
