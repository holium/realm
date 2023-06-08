import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';

import { isMac, isWindows } from './env';

let realmCursorEnabled = true;

const hideCursorCss = `
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

const showCursorCss = `
  * {
    cursor: inherit !important;
  }
  *::before,
  *::after {
    cursor: inherit !important;
  }
  *:hover {
    cursor: inherit !important;
  }
  *:active {
    cursor: inherit !important;
  }
  *:focus {
    cursor: inherit !important;
  }
  *:focus-within {
    cursor: inherit !important;
  }
  *:focus-visible {
    cursor: inherit !important;
  }
  *:focus:not(:focus-visible) {
    cursor: inherit !important;
  }
`;

const hideCursor = (webContents: Electron.WebContents) => {
  webContents.insertCSS(hideCursorCss);
};

const showCursor = (webContents: Electron.WebContents) => {
  webContents.insertCSS(showCursorCss);
};

const enableRealmCursor = (
  mainWindow: BrowserWindow,
  mouseOverlayWindow: BrowserWindow
) => {
  realmCursorEnabled = true;
  mouseOverlayWindow.webContents.send('enable-realm-cursor');

  if (isMac) {
    hideCursor(mouseOverlayWindow.webContents);
    hideCursor(mainWindow.webContents);
    mouseOverlayWindow.setWindowButtonVisibility(false);
    /**
     * For macOS we enable mouse layer tracking for a smoother experience.
     * It is not supported for Windows or Linux.
     */
    mouseOverlayWindow.webContents.send('enable-mouse-layer-tracking');
  } else if (isWindows) {
    hideCursor(mouseOverlayWindow.webContents);
    hideCursor(mainWindow.webContents);
  } else {
    mouseOverlayWindow.webContents.send('disable-realm-cursor');
  }
};

export const disableRealmCursor = (
  mainWindow: BrowserWindow,
  mouseOverlayWindow: BrowserWindow
) => {
  realmCursorEnabled = false;
  showCursor(mouseOverlayWindow.webContents);
  showCursor(mainWindow.webContents);
  mouseOverlayWindow.webContents.send('disable-realm-cursor');
};

const registerListeners = (
  mainWindow: BrowserWindow,
  newMouseWindow: BrowserWindow
) => {
  mainWindow.webContents.on('dom-ready', () => {
    // We use the default cursor for Linux.
    if (realmCursorEnabled && (isMac || isWindows)) {
      hideCursor(mainWindow.webContents);
    }
  });

  mainWindow.webContents.on('did-attach-webview', (_, webContents) => {
    webContents.on('dom-ready', () => {
      if (realmCursorEnabled && (isMac || isWindows)) {
        hideCursor(webContents);
      }
    });
  });

  newMouseWindow.webContents.on('dom-ready', () => {
    if (realmCursorEnabled) {
      enableRealmCursor(mainWindow, newMouseWindow);
    } else {
      disableRealmCursor(mainWindow, newMouseWindow);
    }
  });

  ipcMain.removeHandler('enable-realm-cursor');
  ipcMain.removeHandler('disable-realm-cursor');
  ipcMain.removeHandler('is-realm-cursor-enabled');

  ipcMain.handle('enable-realm-cursor', () => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    enableRealmCursor(mainWindow, newMouseWindow);
    mainWindow.reload();
  });

  ipcMain.handle('disable-realm-cursor', () => {
    const mainWindow = BrowserWindow.getAllWindows().find((window) =>
      ['Realm Chat', 'Realm'].includes(window.title)
    );

    if (!mainWindow) {
      log.error('Could not find main window');
      return;
    }

    disableRealmCursor(mainWindow, newMouseWindow);

    mainWindow.reload();
  });

  ipcMain.handle('is-realm-cursor-enabled', () => realmCursorEnabled);
};

export const CursorSettingsHelper = {
  registerListeners,
};
