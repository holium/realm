import { app, BrowserWindow, Menu, MenuItem, nativeImage } from 'electron';
import Store from 'electron-store';

import { RealmService } from '../os/realm.service';
import { AppUpdater } from './AppUpdater';
import { setRealmCursor } from './helpers/cursorSettings';
import { isArm64, isMac } from './helpers/env';
import { getAssetPath } from './util';
import {
  createMouseOverlayWindow,
  createRealmWindow,
  createStandaloneChatWindow,
} from './windows';

import './logging';

const store = new Store();

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

  setRealmCursor(true);
  realmWindow = createRealmWindow();
  mouseOverlayWindow = createMouseOverlayWindow(realmWindow);

  // Change dock icon to realm icon.
  const realmImage = nativeImage.createFromPath(getAssetPath('icon.png'));
  app.dock.setIcon(realmImage);

  // Update dock menu to include 'Switch to Chat' menu item.
  const defaultMenuItems =
    app.dock
      .getMenu()
      ?.items.filter(
        (item) =>
          item.label !== 'Switch to Realm' && item.label !== 'Switch to Chat'
      ) ?? [];
  const newMenuItem = new MenuItem({
    label: 'Switch to Chat',
    click: bootStandaloneChat,
  });
  app.dock.setMenu(Menu.buildFromTemplate([...defaultMenuItems, newMenuItem]));

  realmWindow.on('close', () => {
    realmWindow = null;
  });

  mouseOverlayWindow.on('close', () => {
    mouseOverlayWindow = null;
  });

  store.set('isStandaloneChat', false);
};

export const bootStandaloneChat = () => {
  if (!realmService) {
    realmService = new RealmService();
  }

  if (realmWindow) {
    if (realmWindow.isClosable()) {
      realmWindow.close();
    }
    realmWindow.destroy();

    realmWindow = null;
  }

  setRealmCursor(false);
  standaloneChatWindow = createStandaloneChatWindow();
  mouseOverlayWindow = createMouseOverlayWindow(standaloneChatWindow);

  // Change dock icon to standalone chat icon.
  const standaloneImage = nativeImage.createFromPath(
    getAssetPath('standalone-chat-icon.png')
  );
  app.dock.setIcon(standaloneImage);

  // Update dock menu to include 'Switch to Realm' menu item.
  const defaultMenuItems =
    app.dock
      .getMenu()
      ?.items.filter(
        (item) =>
          item.label !== 'Switch to Realm' && item.label !== 'Switch to Chat'
      ) ?? [];
  const newMenuItem = new MenuItem({
    label: 'Switch to Realm',
    click: bootRealm,
  });
  app.dock.setMenu(Menu.buildFromTemplate([...defaultMenuItems, newMenuItem]));

  standaloneChatWindow.on('close', () => {
    standaloneChatWindow = null;
  });

  store.set('isStandaloneChat', true);
};

app
  .whenReady()
  .then(() => {
    updater = new AppUpdater();
    updater.checkingForUpdates = true;
    updater.checkForUpdates().then(() => {
      updater.checkingForUpdates = false;

      // Boot whatever the user last used.
      if (store.get('isStandaloneChat')) {
        bootStandaloneChat();
      } else {
        bootRealm();
      }
    });

    app.on('before-quit', () => {
      if (isMac && isArm64) {
        realmWindow?.isClosable() && realmWindow?.close();
        standaloneChatWindow?.isClosable() && standaloneChatWindow?.close();
        app.exit();
      }
    });
  })
  .catch(console.error);
