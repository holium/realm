import { app, BrowserWindow, Menu, MenuItem, nativeImage } from 'electron';
import Store from 'electron-store';

import { RealmService } from '../os/realm.service';
import { AppUpdater } from './AppUpdater';
import { setRealmCursor } from './helpers/cursorSettings';
import { isMac, isMacWithCameraNotch } from './helpers/env';
import { windowWindow } from './helpers/fullscreen';
import { MenuBuilder } from './menu';
import { getAssetPath } from './util';
import {
  createMouseOverlayWindow,
  createRealmWindow,
  createStandaloneChatWindow,
} from './windows';

import './logging';

const store = new Store();

let updater: AppUpdater;
let menuBuilder: MenuBuilder | null;
let realmService: RealmService | null;
export const getRealmService = () => realmService;

// The realm window has a mouse overlay window associated with it.
// The standalone chat window is for booting Realm in a standalone mode
// and does not have a mouse overlay window.
let realmWindow: BrowserWindow | null;
let mouseOverlayWindow: BrowserWindow | null;
let standaloneChatWindow: BrowserWindow | null;

const updateMacDockMenu = (
  macDock: Electron.Dock,
  mode: 'realm' | 'standalone-chat'
) => {
  const currentMenuItems = macDock.getMenu()?.items ?? [];
  const defaultMenuItems =
    currentMenuItems.filter(
      (item) =>
        item.label !== 'Switch to Realm' && item.label !== 'Switch to Chat'
    ) ?? [];
  if (mode === 'realm') {
    const newMenuItem = new MenuItem({
      label: 'Switch to Chat',
      click: bootStandaloneChat,
    });
    macDock.setMenu(Menu.buildFromTemplate([...defaultMenuItems, newMenuItem]));
  } else {
    const newMenuItem = new MenuItem({
      label: 'Switch to Realm',
      click: bootRealm,
    });
    macDock.setMenu(Menu.buildFromTemplate([...defaultMenuItems, newMenuItem]));
  }
};

export const bootRealm = () => {
  store.set('isStandaloneChat', false);

  if (!realmService) {
    realmService = new RealmService();
  }

  if (standaloneChatWindow && !standaloneChatWindow.isDestroyed()) {
    standaloneChatWindow.destroy();
  }

  standaloneChatWindow = null;
  mouseOverlayWindow = null;

  setRealmCursor(true);
  realmWindow = createRealmWindow();
  mouseOverlayWindow = createMouseOverlayWindow(realmWindow);

  menuBuilder = null;

  menuBuilder = new MenuBuilder(realmWindow);
  menuBuilder.buildMenu();

  const realmImage = nativeImage.createFromPath(getAssetPath('icon.png'));
  if (isMac) {
    const macDock = app.dock;
    if (!macDock) return;

    // Change dock icon to realm icon.
    macDock.setIcon(realmImage);
    // Update dock menu to include 'Switch to Chat' menu item.
    updateMacDockMenu(macDock, 'realm');
  } else {
    // On Windows we are able to change the icon of the window itself.
    realmWindow.setIcon(realmImage);
  }

  realmWindow.on('close', () => {
    realmWindow = null;
  });

  mouseOverlayWindow.on('close', () => {
    mouseOverlayWindow = null;
  });
};

export const bootStandaloneChat = () => {
  store.set('isStandaloneChat', true);

  if (!realmService) {
    realmService = new RealmService();
  }

  if (realmWindow && !realmWindow.isDestroyed()) {
    // We need to window the window before closing it, otherwise
    // the Mac menubar isn't reliably restored from simple fullscreen.
    windowWindow(realmWindow);
    realmWindow.destroy();
  }

  realmWindow = null;

  setRealmCursor(false);
  standaloneChatWindow = createStandaloneChatWindow();
  mouseOverlayWindow = createMouseOverlayWindow(standaloneChatWindow);

  menuBuilder = null;

  menuBuilder = new MenuBuilder(standaloneChatWindow);
  menuBuilder.buildMenu();

  const standaloneImage = nativeImage.createFromPath(
    getAssetPath('standalone-chat-icon.png')
  );
  if (isMac) {
    const macDock = app.dock;
    if (!macDock) return;

    // Change dock icon to standalone chat icon.
    macDock.setIcon(standaloneImage);

    // Update dock menu to include 'Switch to Realm' menu item.
    updateMacDockMenu(macDock, 'standalone-chat');
  } else {
    // On Windows we are able to change the icon of the window itself.
    standaloneChatWindow.setIcon(standaloneImage);
  }

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

      // Boot whatever the user last used.
      if (store.get('isStandaloneChat')) {
        bootStandaloneChat();
      } else {
        bootRealm();
      }
    });

    app.on('before-quit', () => {
      // For Macs with camera notch we're using simple fullscreen,
      // then this is required to exit the app.
      if (isMacWithCameraNotch()) {
        realmWindow?.isClosable() && realmWindow?.close();
        standaloneChatWindow?.isClosable() && standaloneChatWindow?.close();
        app.exit();
      }
    });
  })
  .catch(console.error);
