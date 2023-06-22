import { BrowserWindow, shell } from 'electron';

import { BrowserHelper } from './helpers/browser';
import { CursorSettingsHelper } from './helpers/cursorSettings';
import { DeepLinkHelper } from './helpers/deepLink';
import { DevHelper } from './helpers/dev';
import { isArm64Mac } from './helpers/env';
import {
  FullScreenHelper,
  fullScreenWindow,
  hasBeenExpanded,
  windowWindow,
} from './helpers/fullscreen';
import { KeyHelper } from './helpers/key';
import { MediaHelper } from './helpers/media';
import { MouseEventsHelper } from './helpers/mouseEvents';
import { PowerHelper } from './helpers/power';
import { StandaloneHelper } from './helpers/standalone';
import { TitlebarHelper } from './helpers/titlebar';
import { WebViewHelper } from './helpers/webview';
import { getAssetPath, getPreloadPath, resolveHtmlPath } from './util';

const defaultRealmWindowOptions: Electron.BrowserWindowConstructorOptions = {
  show: false,
  frame: isArm64Mac ? false : true,
  // We start with a zero size window and enlarge it,
  // to trigger the mouse-in event when the window is shown.
  width: 0,
  height: 0,
  fullscreenable: true, // Explicitly needed for non-Arm64 Macs.
  icon: getAssetPath('icon.png'),
  title: 'Realm',
  fullscreen: false,
  simpleFullscreen: false,
  acceptFirstMouse: true,
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
  newRealmWindow.loadURL(resolveHtmlPath('index.html'));

  WebViewHelper.registerListeners(newRealmWindow);
  DevHelper.registerListeners(newRealmWindow);
  MediaHelper.registerListeners();
  BrowserHelper.registerListeners(newRealmWindow);
  PowerHelper.registerListeners(newRealmWindow);
  KeyHelper.registerListeners(newRealmWindow);
  DeepLinkHelper.registerListeners(newRealmWindow);
  TitlebarHelper.registerListeners(newRealmWindow);
  StandaloneHelper.registerListeners();

  newRealmWindow.webContents.on('dom-ready', () => {
    newRealmWindow.webContents.send('add-mouse-listeners', true);
    newRealmWindow.webContents.send('add-key-listeners');
  });

  newRealmWindow.on('ready-to-show', () => {
    if (process.env.START_MINIMIZED) {
      newRealmWindow.minimize();
    } else {
      newRealmWindow.show();
    }

    if (!hasBeenExpanded(newRealmWindow)) {
      fullScreenWindow(newRealmWindow);
    }
  });

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
    show: false,
    title: 'Mouse Overlay',
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
  CursorSettingsHelper.registerListeners(parentWindow, newMouseWindow);
  MouseEventsHelper.registerListeners(parentWindow, newMouseWindow);

  newMouseWindow.on('ready-to-show', () => {
    newMouseWindow.show();
  });

  newMouseWindow.on('close', () => {
    if (parentWindow.isClosable()) parentWindow.close();
  });

  parentWindow.on('close', () => {
    if (newMouseWindow.isClosable()) newMouseWindow.close();
  });

  parentWindow.on('resize', () => {
    const newBounds = parentWindow.getBounds();

    newMouseWindow.setBounds(newBounds);
    parentWindow.webContents.send('set-dimensions', {
      width: newBounds.width,
      height: newBounds.height - (isArm64Mac ? 40 : 0),
    });
  });

  parentWindow.on('move', () => {
    const newBounds = parentWindow.getBounds();

    newMouseWindow.setBounds(newBounds);
    parentWindow.webContents.send('set-dimensions', {
      width: newBounds.width,
      height: newBounds.height - (isArm64Mac ? 40 : 0),
    });
  });

  return newMouseWindow;
};

export const createStandaloneChatWindow = () => {
  const newStandaloneChatWindow = new BrowserWindow({
    ...defaultRealmWindowOptions,
    title: 'Realm Chat',
    icon: getAssetPath('standalone-chat-icon.png'),
  });
  newStandaloneChatWindow.setMenuBarVisibility(false);
  newStandaloneChatWindow.loadURL(resolveHtmlPath('index.html'));

  WebViewHelper.registerListeners(newStandaloneChatWindow);
  DevHelper.registerListeners(newStandaloneChatWindow);
  MediaHelper.registerListeners();
  BrowserHelper.registerListeners(newStandaloneChatWindow);
  PowerHelper.registerListeners(newStandaloneChatWindow);
  KeyHelper.registerListeners(newStandaloneChatWindow);
  DeepLinkHelper.registerListeners(newStandaloneChatWindow);
  TitlebarHelper.registerListeners(newStandaloneChatWindow);
  StandaloneHelper.registerListeners();

  newStandaloneChatWindow.webContents.on('dom-ready', () => {
    newStandaloneChatWindow.webContents.send('add-mouse-listeners', true);
    newStandaloneChatWindow.webContents.send('add-key-listeners');
  });

  newStandaloneChatWindow.on('ready-to-show', () => {
    if (!hasBeenExpanded(newStandaloneChatWindow)) {
      windowWindow(newStandaloneChatWindow);
    }

    newStandaloneChatWindow.show();
  });

  // Open standalone URLs in the user's default browser.
  newStandaloneChatWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  return newStandaloneChatWindow;
};
