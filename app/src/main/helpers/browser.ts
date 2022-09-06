import { BrowserWindow } from 'electron';

export const registerListeners = (mainWindow: BrowserWindow) => {
  const webContents = mainWindow.webContents;
  webContents.on('will-navigate', function (e, url) {
    if (url != webContents.getURL()) {
      e.preventDefault();
      mainWindow.webContents.send('realm.browser.open', url);
    }
  });
  // mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  //   console.log('opening link in Relic');
  //   mainWindow.webContents.send('realm.browser.open', url);
  //   return { action: 'deny' };
  // });
};

export default { registerListeners };
