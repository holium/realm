import { BrowserWindow, Event, Input, ipcMain, Menu } from 'electron';

import { isMac } from './env';

const registerListeners = (mainWindow: BrowserWindow) => {
  if (isMac) {
    registerDarwinListeners(mainWindow);
  } else {
    // registerDefaultListeners(mainWindow);
  }

  ipcMain.handle('shortcut-enabled', (_, id: string, enabled: boolean) => {
    const menu = Menu.getApplicationMenu();
    if (!menu) return;
    const menuItem = menu.getMenuItemById(id);
    if (!menuItem) return;
    menuItem.enabled = enabled;
  });
};

const registerDarwinListeners = (mainWindow: BrowserWindow) => {
  mainWindow.webContents.on(
    'before-input-event',
    (event: Event, input: Input) => {
      // CMD on Mac
      if (input.meta && input.type === 'keyDown') {
        if (input.key === 'w') {
          mainWindow.webContents.send('shortcut-event', 'close-current-window');
          event.preventDefault();
        }
      }
    }
  );
};

export const ShortcutHelper = { registerListeners };
