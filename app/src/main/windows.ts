import { BrowserWindow, screen, shell } from 'electron';

import { BrowserHelper } from './helpers/browser';
import { CursorSettingsHelper } from './helpers/cursorSettings';
import { DeepLinkHelper } from './helpers/deepLink';
import { DevHelper } from './helpers/dev';
import {
  expandWindowToFullscreen,
  FullScreenHelper,
  hasBeenExpanded,
  toggleFullScreen,
  useSimpleFullscreen,
} from './helpers/fullscreen';
import { KeyHelper } from './helpers/key';
import { MediaHelper } from './helpers/media';
import { MouseEventsHelper } from './helpers/mouseEvents';
import { PowerHelper } from './helpers/power';
import { StandaloneHelper } from './helpers/standalone';
import { TitlebarHelper } from './helpers/titlebar';
import { WebViewHelper } from './helpers/webview';
import { MenuBuilder } from './menu';
import { getAssetPath, getPreloadPath, resolveHtmlPath } from './util';

const getDefaultRealmWindowOptions = (
  width: number,
  height: number
): Electron.BrowserWindowConstructorOptions => ({
  show: false,
  frame: useSimpleFullscreen ? false : true,
  // We start with a zero size window and enlarge it,
  // to trigger the mouse-in event when the window is shown.
  width,
  height,
  icon: getAssetPath('icon.png'),
  title: 'Realm',
  fullscreen: true,
  acceptFirstMouse: true,
  // turn on simple fullscreen for arm64 mac to fill notch area
  simpleFullscreen: useSimpleFullscreen,
  webPreferences: {
    nodeIntegration: false,
    webviewTag: true,
    sandbox: false,
    contextIsolation: true,
    preload: getPreloadPath(),
  },
});

export const createRealmWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const defaultRealmWindowOptions = getDefaultRealmWindowOptions(
    useSimpleFullscreen ? 0 : width,
    useSimpleFullscreen ? 0 : height
  );
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
      expandWindowToFullscreen(newRealmWindow);
    }

    toggleFullScreen(newRealmWindow, true);
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

  newMouseWindow.on('close', () => {
    if (parentWindow.isClosable()) parentWindow.close();
  });

  parentWindow.on('close', () => {
    if (newMouseWindow.isClosable()) newMouseWindow.close();
  });

  parentWindow.on('resize', () => {
    const newDimension = parentWindow.getBounds();

    newMouseWindow.setBounds(newDimension);
    parentWindow.webContents.send('set-dimensions', newDimension);
  });

  return newMouseWindow;
};

export const createStandaloneChatWindow = () => {
  // Always start at 0,0 so the mouse crosses the non-fullscreen window.
  const defaultRealmWindowOptions = getDefaultRealmWindowOptions(0, 0);
  const newStandaloneChatWindow = new BrowserWindow({
    ...defaultRealmWindowOptions,
    title: 'Realm Chat',
    // Windowed by default.
    fullscreen: false,
    simpleFullscreen: false,
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
      expandWindowToFullscreen(newStandaloneChatWindow);
    }

    newStandaloneChatWindow.show();
  });

  return newStandaloneChatWindow;
};
