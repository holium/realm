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
    !mouseOverlayWindow.isDestroyed &&
      hideSystemCursor(mouseOverlayWindow.webContents);
    !mainWindow.isDestroyed && hideSystemCursor(mainWindow.webContents);
  } else if (isWindows) {
    !mouseOverlayWindow.isDestroyed &&
      hideSystemCursor(mouseOverlayWindow.webContents);
    !mainWindow.isDestroyed && hideSystemCursor(mainWindow.webContents);
  }
};

export const disableRealmCursor = (
  mainWindow: BrowserWindow,
  mouseOverlayWindow: BrowserWindow
) => {
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
    // We use the default cursor for Linux.
    if (realmCursorEnabled) {
      hideSystemCursor(mainWindow.webContents);
    }
  });

  mainWindow.webContents.on('did-attach-webview', (_, webContents) => {
    webContents.on('dom-ready', () => {
      if (realmCursorEnabled) {
        hideSystemCursor(webContents);
      }
    });
  });

  mouseOverlayWindow.webContents.on('dom-ready', () => {
    if (realmCursorEnabled) {
      enableRealmCursor(mainWindow, mouseOverlayWindow);
    } else {
      disableRealmCursor(mainWindow, mouseOverlayWindow);
    }
  });

  ipcMain.removeHandler('enable-realm-cursor');
  ipcMain.removeHandler('disable-realm-cursor');
  ipcMain.removeHandler('is-realm-cursor-enabled');

  ipcMain.handle('enable-realm-cursor', () => {
    const enabled = setRealmCursor(true);
    if (!enabled) return;

    enableRealmCursor(mainWindow, mouseOverlayWindow);
  });

  ipcMain.handle('disable-realm-cursor', () => {
    setRealmCursor(false);

    disableRealmCursor(mainWindow, mouseOverlayWindow);
  });

  ipcMain.handle('is-realm-cursor-enabled', () => realmCursorEnabled);
};

export const CursorSettingsHelper = {
  registerListeners,
};
