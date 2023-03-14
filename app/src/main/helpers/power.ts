import { BrowserWindow, powerMonitor } from 'electron';

const registerListeners = (mainWindow: BrowserWindow) => {
  // device-state-change callbacks and listeners
  powerMonitor.on('suspend', () => {
    mainWindow.webContents.send('realm.sys.sleep');
    mainWindow.webContents.send('realm.sys.suspend');
  });
  powerMonitor.on('resume', () => {
    mainWindow.webContents.send('realm.sys.wake');
    mainWindow.webContents.send('realm.sys.resume');
  });
  powerMonitor.on('on-ac', () => {
    mainWindow.webContents.send('realm.sys.on-ac');
  });
  powerMonitor.on('on-battery', () => {
    mainWindow.webContents.send('realm.sys.on-battery');
  });
  powerMonitor.on('shutdown', () => {
    mainWindow.webContents.send('realm.sys.sleep');
    mainWindow.webContents.send('realm.sys.shutdown');
  });
  powerMonitor.on('lock-screen', () => {
    mainWindow.webContents.send('realm.sys.sleep');
    mainWindow.webContents.send('realm.sys.lock-screen');
  });
  powerMonitor.on('unlock-screen', () => {
    mainWindow.webContents.send('realm.sys.wake');
    mainWindow.webContents.send('realm.sys.unlock-screen');
  });
};

export const PowerHelper = { registerListeners };
