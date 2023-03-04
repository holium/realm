import { BrowserWindow, ipcMain, screen } from 'electron';
import { MouseState } from '@holium/realm-multiplayer';
import { Position } from '../../os/types';
import { denormalizePosition } from '../../os/services/shell/lib/window-manager';

const getWebContentsPosition = (mainWindow: BrowserWindow) => {
  const screenPosition = screen.getCursorScreenPoint();
  const mainWindowPosition = mainWindow.getPosition();
  return {
    x: screenPosition.x - mainWindowPosition[0],
    y: screenPosition.y - mainWindowPosition[1],
  };
};

const registerListeners = (
  mainWindow: BrowserWindow,
  mouseWindow: BrowserWindow
) => {
  // We send mouse events to the mouse window to move the cursor,
  // – as well as the main window to update multiplayer cursors via %rooms-v2.
  ipcMain.handle('mouse-out', () => {
    mouseWindow.webContents.send('mouse-out');
    mainWindow.webContents.send('mouse-out');
  });

  ipcMain.handle('mouse-move', (_, state: MouseState, isDragging: boolean) => {
    const webContentsPosition = getWebContentsPosition(mainWindow);
    mouseWindow.webContents.send(
      'mouse-move',
      webContentsPosition,
      state,
      isDragging
    );
    mainWindow.webContents.send(
      'mouse-move',
      webContentsPosition,
      state,
      isDragging
    );
  });

  ipcMain.handle('mouse-down', () => {
    mouseWindow.webContents.send('mouse-down');
    mainWindow.webContents.send('mouse-down');
  });

  ipcMain.handle('mouse-up', () => {
    mouseWindow.webContents.send('mouse-up');
    mainWindow.webContents.send('mouse-up');
  });

  ipcMain.handle('mouse-color', (_, color: string) => {
    mouseWindow.webContents.send('mouse-color', color);
  });

  /* Multiplayer mouse events */
  ipcMain.handle('multiplayer.mouse-out', (_, patp: string) => {
    mouseWindow.webContents.send('multiplayer.mouse-out', patp);
  });

  ipcMain.handle(
    'multiplayer.mouse-move',
    (
      _,
      patp: string,
      normalizedPosition: Position,
      state: MouseState,
      hexColor: string
    ) => {
      const denormalizedPosition = denormalizePosition(
        normalizedPosition,
        mainWindow.getBounds()
      );
      mouseWindow.webContents.send(
        'multiplayer.mouse-move',
        patp,
        denormalizedPosition,
        state,
        hexColor
      );
    }
  );

  ipcMain.handle('multiplayer.mouse-down', (_, patp: string) => {
    mouseWindow.webContents.send('multiplayer.mouse-down', patp);
  });

  ipcMain.handle('multiplayer.mouse-up', (_, patp: string) => {
    mouseWindow.webContents.send('multiplayer.mouse-up', patp);
  });

  ipcMain.handle(
    'multiplayer.app-to-realm-mouse-click',
    (_, patp: string, elementId: string) => {
      mainWindow.webContents.send(
        'multiplayer.app-to-realm-mouse-click',
        patp,
        elementId
      );
    }
  );

  ipcMain.handle(
    'multiplayer.realm-to-app-mouse-click',
    (_, patp: string, elementId: string) => {
      mainWindow.webContents.send(
        'multiplayer.realm-to-app-mouse-click',
        patp,
        elementId
      );
    }
  );
};

export const MouseHelper = { registerListeners };
