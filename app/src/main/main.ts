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
let realmService: RealmService | null;

// The realm window has a mouse overlay window associated with it.
// The standalone chat window is for booting Realm in a standalone mode
// and does not have a mouse overlay window.
let realmWindow: BrowserWindow | null;
let mouseOverlayWindow: BrowserWindow | null;
let standaloneChatWindow: BrowserWindow | null;

const bootRealm = () => {
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

  realmWindow.on('close', () => {
    realmWindow = null;
  });

  mouseOverlayWindow.on('close', () => {
    mouseOverlayWindow = null;
  });
};

const bootStandaloneChat = () => {
  if (!realmService) {
    realmService = new RealmService();
  }

  if (realmWindow && realmWindow.isClosable()) {
    realmWindow.close();
    realmWindow = null;
  }

  // Create a mouse overlay window just to init listeners.
  standaloneChatWindow = createStandaloneChatWindow();
  mouseOverlayWindow = createMouseOverlayWindow(standaloneChatWindow);

  standaloneChatWindow.on('close', () => {
    standaloneChatWindow = null;
  });

  mouseOverlayWindow.on('close', () => {
    mouseOverlayWindow = null;
  });
};

app
  .whenReady()
  .then(() => {
    updater = new AppUpdater();
    updater.checkingForUpdates = true;
    updater.checkForUpdates().then(() => {
      updater.checkingForUpdates = false;

      const isStandaloneChat = app.commandLine.hasSwitch('standalone-chat');
      if (isStandaloneChat) {
        bootStandaloneChat();
      } else {
        bootRealm();
      }
    });
  })
  .catch(console.error);
