import { app, BrowserWindow } from 'electron';

export const registerListeners = (mainWindow: BrowserWindow) => {
  const webContents = mainWindow.webContents;
  webContents.on('will-navigate', function (e, url) {
    if (url !== webContents.getURL()) {
      e.preventDefault();
      mainWindow.webContents.send('realm.browser.open', url);
    }
  });

  // Listen for web contents being created
  app.on(
    'web-contents-created',
    (_event: Electron.Event, webContents: Electron.WebContents) => {
      // Check for a webview
      if (webContents.getType() === 'webview') {
        // Listen for any new window events
        webContents.setWindowOpenHandler(({ url }) => {
          mainWindow.webContents.send('realm.browser.open', url);
          return { action: 'deny' };
        });
      }
    }
  );
};

export default { registerListeners };

//  webContents.on(
//    'context-menu',
//    (event: Electron.Event, props: Electron.ContextMenuParams) => {
//      const menu = new Menu();
//      const menuItem = new MenuItem({
//        label: 'Inspect Element',
//        click: () => {
//          webContents.inspectElement(props.x, props.y);
//        },
//      });
//      menu.append(menuItem);
//      // const { x, y } = props;
//      // mainWindow.webContents.send('realm.browser.contextmenu', {
//      //   x,
//      //   y,
//      // });
//      event.preventDefault();
//      console.log(webContents.getType());
//      menu.popup(webContents);
//    }
//  );
