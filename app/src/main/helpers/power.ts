import { BrowserWindow, powerMonitor } from 'electron';

const registerListeners = (mainWindow: BrowserWindow) => {
  powerMonitor.on('suspend', () => {
    if (mainWindow.isDestroyed()) return;

    console.log('powerMonitor.suspend');
    mainWindow.webContents.send('realm.sys.sleep');
    mainWindow.webContents.send('realm.sys.suspend');
  });
  powerMonitor.on('resume', () => {
    if (mainWindow.isDestroyed()) return;
    console.log('powerMonitor.resume');
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
