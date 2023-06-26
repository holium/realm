import { BrowserWindow, ipcMain } from 'electron';
import Store from 'electron-store';

import { isMac, isWindows } from './env';

const store = new Store();

let realmCursorEnabled = false;

export const setRealmCursor = (show: boolean) => {
  const isStandaloneChat = store.get('isStandaloneChat');

  realmCursorEnabled = show && (isMac || isWindows) && !isStandaloneChat;

  return realmCursorEnabled;
};

const hideSystemCursorCss = `
  * {
    cursor: none !important;
  }
  *::before,
  *::after {
    cursor: none !important;
  }
  *:hover {
    cursor: none !important;
  }
  *:active {
    cursor: none !important;
  }
  *:focus {
    cursor: none !important;
  }
  *:focus-within {
    cursor: none !important;
  }
  *:focus-visible {
    cursor: none !important;
  }
  *:focus:not(:focus-visible) {
    cursor: none !important;
  }

  .react-player-hide-cursor {
    cursor: none !important;
  }

  video::-webkit-media-controls-panel {
    cursor: none !important;
  }

  video::-webkit-media-controls-play-button {
    cursor: none !important;
  }

  video::-webkit-media-controls-volume-slider-container {
    cursor: none !important;
  }

  video::-webkit-media-controls-volume-slider {
    cursor: none !important;
  }

  video::-webkit-media-controls-mute-button {
    cursor: none !important;
  }

  video::-webkit-media-controls-timeline {
    cursor: none !important;
  }

  video::-webkit-media-controls-current-time-display {
    cursor: none !important;
  }

  video::-webkit-full-page-media::-webkit-media-controls-panel {
    cursor: none !important;
  }

  video::-webkit-media-controls-panel {
    cursor: none !important;
  }

  video::-webkit-media-controls-start-playback-button {
    cursor: none !important;
  }

  video::-webkit-media-controls-overlay-play-button {
    cursor: none !important;
  }

  video::-webkit-media-controls-toggle-closed-captions-button {
    cursor: none !important;
  }

  video::-webkit-media-controls-status-display {
    cursor: none !important;
  }

  video::-webkit-media-controls-mouse-display {
    cursor: none !important;
  }

  video::-webkit-media-controls-timeline-container {
    cursor: none !important;
  }

  video::-webkit-media-controls-time-remaining-display {
    cursor: none !important;
  }

  video::-webkit-media-controls-seek-back-button {
    cursor: none !important;
  }

  video {
    cursor: none !important;
  }

  video::-webkit-media-controls-seek-forward-button {
    cursor: none !important;
  }

  video::-webkit-media-controls-fullscreen-button {
    cursor: none !important;
  }

  video::-webkit-media-controls-enclosure {
    cursor: none !important;
  }

  video::-webkit-media-controls-rewind-button {
    cursor: none !important;
  }

  video::-webkit-media-controls-return-to-realtime-button {
    cursor: none !important;
  }

  video::-webkit-media-controls-toggle-closed-captions-button {
    cursor: none !important;
  }
`;

const showSystemCursorCss = `
  * {
    cursor: auto !important;
  }
  *::before,
  *::after {
    cursor: auto !important;
  }
  *:hover {
    cursor: auto !important;
  }
  *:active {
    cursor: auto !important;
  }
  *:focus {
    cursor: auto !important;
  }
  *:focus-within {
    cursor: auto !important;
  }
  *:focus-visible {
    cursor: auto !important;
  }
  *:focus:not(:focus-visible) {
    cursor: auto !important;
  }
`;

const hideSystemCursor = (webContents: Electron.WebContents) => {
  webContents.insertCSS(hideSystemCursorCss);
};

const showSystemCursor = (webContents: Electron.WebContents) => {
  webContents.insertCSS(showSystemCursorCss);
};

const enableRealmCursor = (
  mainWindow: BrowserWindow,
  mouseOverlayWindow: BrowserWindow
) => {
  if (isMac) {
    hideSystemCursor(mouseOverlayWindow.webContents);
    hideSystemCursor(mainWindow.webContents);
  } else if (isWindows) {
    hideSystemCursor(mouseOverlayWindow.webContents);
    hideSystemCursor(mainWindow.webContents);
  }
};

export const disableRealmCursor = (
  mainWindow: BrowserWindow,
  mouseOverlayWindow: BrowserWindow
) => {
  if (mainWindow.isDestroyed()) return;

  const isStandaloneChat = store.get('isStandaloneChat');

  // In Realm you can toggle the cursor in settings,
  // but in standalone we don't need to override the `cursor: none` since it's never applied.
  if (!isStandaloneChat) {
    showSystemCursor(mouseOverlayWindow.webContents);
    showSystemCursor(mainWindow.webContents);
  }

  mouseOverlayWindow.webContents.send('disable-realm-cursor');
};

const registerListeners = (
  mainWindow: BrowserWindow,
  mouseOverlayWindow: BrowserWindow
) => {
  mainWindow.webContents.on('dom-ready', () => {
    if (mainWindow.isDestroyed()) return;

    // We use the default cursor for Linux.
    if (realmCursorEnabled) {
      hideSystemCursor(mainWindow.webContents);
    }
  });

  mainWindow.webContents.on('did-attach-webview', (_, webContents) => {
    if (mainWindow.isDestroyed()) return;

    webContents.on('dom-ready', () => {
      if (realmCursorEnabled) {
        hideSystemCursor(webContents);
      }
    });
  });

  mouseOverlayWindow.webContents.on('dom-ready', () => {
    if (mainWindow.isDestroyed()) return;

    if (realmCursorEnabled) {
      enableRealmCursor(mainWindow, mouseOverlayWindow);
    } else {
      disableRealmCursor(mainWindow, mouseOverlayWindow);
    }
  });

  ipcMain.removeHandler('enable-realm-cursor');
  ipcMain.removeHandler('disable-realm-cursor');
  ipcMain.removeHandler('is-realm-cursor-enabled');

  ipcMain.handle('enable-realm-cursor', (_, reloadMouseWindow?: boolean) => {
    const enabled = setRealmCursor(true);
    if (!enabled) return;

    enableRealmCursor(mainWindow, mouseOverlayWindow);

    if (reloadMouseWindow) {
      mouseOverlayWindow.reload();
    }
  });

  ipcMain.handle('disable-realm-cursor', (_, reloadMouseWindow?: boolean) => {
    setRealmCursor(false);

    disableRealmCursor(mainWindow, mouseOverlayWindow);

    if (reloadMouseWindow) {
      mouseOverlayWindow.reload();
    }
  });

  ipcMain.handle('is-realm-cursor-enabled', () => realmCursorEnabled);
};

export const CursorSettingsHelper = {
  registerListeners,
};
