import { BrowserWindow, ipcMain } from 'electron';

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

export const hideCursor = (webContents: Electron.WebContents) => {
  webContents.insertCSS(hideCursorCss);
};

const showCursor = (webContents: Electron.WebContents) => {
  webContents.insertCSS(showCursorCss);
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

  const enableRealmCursor = () => {
    realmCursorEnabled = true;
    newMouseWindow.webContents.send('enable-realm-cursor');

    if (isMac) {
      hideCursor(newMouseWindow.webContents);
      hideCursor(mainWindow.webContents);
      newMouseWindow.setWindowButtonVisibility(false);
      /**
       * For macOS we enable mouse layer tracking for a smoother experience.
       * It is not supported for Windows or Linux.
       */
      newMouseWindow.webContents.send('enable-mouse-layer-tracking');
    } else if (isWindows) {
      hideCursor(newMouseWindow.webContents);
      hideCursor(mainWindow.webContents);
    } else {
      newMouseWindow.webContents.send('disable-realm-cursor');
    }
  };

  const disableRealmCursor = () => {
    realmCursorEnabled = false;
    showCursor(newMouseWindow.webContents);
    showCursor(mainWindow.webContents);
    newMouseWindow.webContents.send('disable-realm-cursor');
  };

  newMouseWindow.webContents.on('dom-ready', () => {
    if (realmCursorEnabled) {
      enableRealmCursor();
    } else {
      disableRealmCursor();
    }
  });

  ipcMain.handle('enable-realm-cursor', () => {
    enableRealmCursor();

    const mainWindow = BrowserWindow.getAllWindows()[0];
    mainWindow.reload();
  });

  ipcMain.handle('disable-realm-cursor', () => {
    disableRealmCursor();

    const mainWindow = BrowserWindow.getAllWindows()[0];
    mainWindow.reload();
  });
};

export const CursorHelper = {
  registerListeners,
};
