import { app, BrowserWindow, screen, shell } from 'electron';
import isDev from 'electron-is-dev';

import { BrowserHelper } from './helpers/browser';
import { CursorHelper } from './helpers/cursor';
import { DeepLinkHelper } from './helpers/deepLink';
import { DevHelper } from './helpers/dev';
import { FullScreenHelper } from './helpers/fullscreen';
import { KeyHelper } from './helpers/key';
import { MediaHelper } from './helpers/media';
import { MouseHelper } from './helpers/mouse';
import { PowerHelper } from './helpers/power';
import { TitlebarHelper } from './helpers/titlebar';
import { WebViewHelper } from './helpers/webview';
import { MenuBuilder } from './menu';
import { getAssetPath, getPreloadPath, resolveHtmlPath } from './util';

const { width, height } = screen.getPrimaryDisplay().workAreaSize;

const defaultRealmWindowOptions: Electron.BrowserWindowConstructorOptions = {
  show: false,
  width,
  height,
  icon: getAssetPath('icon.png'),
  title: 'Realm',
  fullscreen: true,
  acceptFirstMouse: true,
  titleBarStyle: 'hidden',
  webPreferences: {
    nodeIntegration: false,
    webviewTag: true,
    sandbox: false,
    contextIsolation: true,
    preload: getPreloadPath(),
  },
};

export const createRealmWindow = () => {
  const newRealmWindow = new BrowserWindow(defaultRealmWindowOptions);
  newRealmWindow.setMenuBarVisibility(false);

  WebViewHelper.registerListeners(newRealmWindow);
  DevHelper.registerListeners(newRealmWindow);
  MediaHelper.registerListeners();
  BrowserHelper.registerListeners(newRealmWindow);
  PowerHelper.registerListeners(newRealmWindow);
  KeyHelper.registerListeners(newRealmWindow);
  DeepLinkHelper.registerListeners(newRealmWindow);
  TitlebarHelper.registerListeners(newRealmWindow);

  newRealmWindow.loadURL(resolveHtmlPath('index.html'));

  newRealmWindow.webContents.on('dom-ready', () => {
    newRealmWindow.webContents.send('add-mouse-listeners', true);
    newRealmWindow.webContents.send('add-key-listeners');
  });

  newRealmWindow.on('ready-to-show', () => {
    if (process.env.START_MINIMIZED) {
      newRealmWindow.minimize();
    } else {
      isDev ? newRealmWindow.showInactive() : newRealmWindow.show();
    }

    const initialDimensions = newRealmWindow.getBounds();

    newRealmWindow.webContents.send('set-dimensions', initialDimensions);
    newRealmWindow.webContents.send(
      'set-fullscreen',
      newRealmWindow.isFullScreen()
    );
  });

  const menuBuilder = new MenuBuilder(newRealmWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  newRealmWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  return newRealmWindow;
};

export const createMouseOverlayWindow = (parentWindow: BrowserWindow) => {
  // Create a window covering the whole main window.
  const defaultMouseWindowOptions: Electron.BrowserWindowConstructorOptions = {
    title: 'Mouse overlay',
    parent: parentWindow,
    ...parentWindow.getBounds(),
    frame: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    resizable: false,
    focusable: false,
    hasShadow: false,
    skipTaskbar: true,
    transparent: true,
    fullscreen: true,
    titleBarStyle: 'hidden',
    acceptFirstMouse: true,
    roundedCorners: false,
    webPreferences: {
      sandbox: false,
      devTools: false,
      contextIsolation: true,
      nodeIntegration: false,
      preload: getPreloadPath(),
    },
  };
  const newMouseWindow = new BrowserWindow(defaultMouseWindowOptions);
  newMouseWindow.setIgnoreMouseEvents(true);
  newMouseWindow.loadURL(resolveHtmlPath('mouse.html'));

  FullScreenHelper.registerListeners(parentWindow, newMouseWindow);
  CursorHelper.registerListeners(parentWindow, newMouseWindow);
  MouseHelper.registerListeners(parentWindow, newMouseWindow);

  newMouseWindow.on('close', () => {
    if (parentWindow.isClosable()) parentWindow.close();
  });

  parentWindow.on('close', () => {
    if (newMouseWindow.isClosable()) newMouseWindow.close();
  });

  parentWindow.on('closed', app.quit);

  parentWindow.on('resize', () => {
    const newDimension = parentWindow.getBounds();

    newMouseWindow.setBounds(newDimension);
    parentWindow.webContents.send('set-dimensions', newDimension);
  });

  return newMouseWindow;
};

export const createStandaloneChatWindow = () => {
  const newStandaloneChatWindow = new BrowserWindow({
    ...defaultRealmWindowOptions,
    title: 'Realm Chat',
    fullscreen: false,
    titleBarStyle: 'default',
    icon: getAssetPath('uqbar.png'),
  });

  newStandaloneChatWindow.loadURL(resolveHtmlPath('index.html'));

  WebViewHelper.registerListeners(newStandaloneChatWindow);
  DevHelper.registerListeners(newStandaloneChatWindow);
  MediaHelper.registerListeners();
  BrowserHelper.registerListeners(newStandaloneChatWindow);
  PowerHelper.registerListeners(newStandaloneChatWindow);
  KeyHelper.registerListeners(newStandaloneChatWindow);
  DeepLinkHelper.registerListeners(newStandaloneChatWindow);
  TitlebarHelper.registerListeners(newStandaloneChatWindow);

  newStandaloneChatWindow.on('ready-to-show', newStandaloneChatWindow.show);

  newStandaloneChatWindow.on('close', app.quit);

  return newStandaloneChatWindow;
};
