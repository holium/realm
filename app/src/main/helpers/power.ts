import { BrowserWindow, powerMonitor } from 'electron';

import { getRealmService } from '../main';

const registerListeners = (mainWindow: BrowserWindow) => {
  powerMonitor.on('suspend', () => {
    if (mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('realm.sys.sleep');
    mainWindow.webContents.send('realm.sys.suspend');
  });
  powerMonitor.on('resume', async () => {
    if (mainWindow.isDestroyed()) return;
    const realmService = getRealmService();
    if (realmService) {
      realmService.reconnectConduit();
    }
    mainWindow.webContents.send('realm.sys.wake');
    mainWindow.webContents.send('realm.sys.resume');
  });
  powerMonitor.on('on-ac', () => {
    if (mainWindow.isDestroyed()) return;

    mainWindow.webContents.send('realm.sys.on-ac');
  });
  powerMonitor.on('on-battery', () => {
    if (mainWindow.isDestroyed()) return;

    mainWindow.webContents.send('realm.sys.on-battery');
  });
  powerMonitor.on('shutdown', () => {
    if (mainWindow.isDestroyed()) return;

    mainWindow.webContents.send('realm.sys.sleep');
    mainWindow.webContents.send('realm.sys.shutdown');
  });
  powerMonitor.on('lock-screen', () => {
    if (mainWindow.isDestroyed()) return;

    mainWindow.webContents.send('realm.sys.sleep');
    mainWindow.webContents.send('realm.sys.lock-screen');
  });
  powerMonitor.on('unlock-screen', () => {
    if (mainWindow.isDestroyed()) return;

    mainWindow.webContents.send('realm.sys.wake');
    mainWindow.webContents.send('realm.sys.unlock-screen');
  });
};

export const PowerHelper = { registerListeners };
