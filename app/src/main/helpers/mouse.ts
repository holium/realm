import { BrowserWindow, ipcMain, screen } from 'electron';
import { MouseState } from '@holium/realm-presences';
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
  // as well as the main window to update multiplayer cursors via %rooms-v2.
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

  ipcMain.handle('realm.toggle-ephemeral-chat', (_, message: string) => {
    mouseWindow.webContents.send('realm.toggle-ephemeral-chat', message);
  });

  ipcMain.handle('realm-to-app.ephemeral-chat', (_, patp, message) => {
    mouseWindow.webContents.send('realm-to-app.ephemeral-chat', patp, message);
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

  ipcMain.handle('multiplayer.toggle', () => {
    mouseWindow.webContents.send('multiplayer.toggle');
  });

  ipcMain.handle(
    'multiplayer.app-to-realm.mouse-click',
    (_, patp: string, elementId: string) => {
      mainWindow.webContents.send(
        'multiplayer.app-to-realm.mouse-click',
        patp,
        elementId
      );
    }
  );

  ipcMain.handle(
    'multiplayer.realm-to-app.mouse-click',
    (_, patp: string, elementId: string) => {
      mainWindow.webContents.send(
        'multiplayer.realm-to-app.mouse-click',
        patp,
        elementId
      );
    }
  );

  ipcMain.handle(
    'multiplayer.app-to-realm.send-transaction',
    (
      _,
      patp: string,
      version: number,
      steps: any,
      clientID: string | number
    ) => {
      mainWindow.webContents.send(
        'multiplayer.app-to-realm.send-transaction',
        patp,
        version,
        steps,
        clientID
      );
    }
  );

  ipcMain.handle(
    'multiplayer.realm-to-app.send-transaction',
    (
      _,
      patp: string,
      version: number,
      steps: any,
      clientID: string | number
    ) => {
      mainWindow.webContents.send(
        'multiplayer.realm-to-app.send-transaction',
        patp,
        version,
        steps,
        clientID
      );
    }
  );

  ipcMain.handle(
    'multiplayer.app-to-realm.send-caret',
    (_, patp: string, position: Position) => {
      mainWindow.webContents.send(
        'multiplayer.app-to-realm.send-caret',
        patp,
        position
      );
    }
  );

  ipcMain.handle(
    'multiplayer.realm-to-app.send-caret',
    (_, patp: string, position: Position) => {
      mainWindow.webContents.send(
        'multiplayer.realm-to-app.send-caret',
        patp,
        position
      );
    }
  );

  ipcMain.handle(
    'multiplayer.realm-to-app.send-chat',
    (_, patp: string, message: string) => {
      mainWindow.webContents.send('multiplayer.realm-to-app.send-chat', patp);
      mouseWindow.webContents.send(
        'multiplayer.realm-to-app.send-chat',
        patp,
        message
      );
    }
  );
};

export const MouseHelper = { registerListeners };
