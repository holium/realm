import { BrowserWindow, ipcMain, screen } from 'electron';
import { ShipModelType } from 'os/services/ship/models/ship';
import { MouseState } from 'renderer/system/mouse/AnimatedCursor';

const registerListeners = (mouseWindow: BrowserWindow) => {
  ipcMain.handle('mouse-over', () => {
    mouseWindow.webContents.send('mouse-over');
  });

  ipcMain.handle('mouse-out', () => {
    mouseWindow.webContents.send('mouse-out');
  });

  ipcMain.handle('mouse-move', (_, state: MouseState, isDragging: boolean) => {
    const screenPosition = screen.getCursorScreenPoint();
    const mouseScreenPosition = mouseWindow.getPosition();
    const webContentsPosition = {
      x: screenPosition.x - mouseScreenPosition[0],
      y: screenPosition.y - mouseScreenPosition[1],
    };
    mouseWindow.webContents.send(
      'mouse-move',
      webContentsPosition,
      state,
      isDragging
    );
  });

  ipcMain.handle('mouse-down', () => {
    mouseWindow.webContents.send('mouse-down');
  });

  ipcMain.handle('mouse-up', () => {
    mouseWindow.webContents.send('mouse-up');
  });

  ipcMain.handle('mouse-color', (_, color: string) => {
    mouseWindow.webContents.send('mouse-color', color);
  });

  ipcMain.handle('set-multiplayer-ship', (_, ship: ShipModelType) => {
    mouseWindow.webContents.send('set-multiplayer-ship', ship);
  });

  ipcMain.handle('set-multiplayer-channel', (_, channel: string) => {
    mouseWindow.webContents.send('set-multiplayer-channel', channel);
  });
};

export const MouseHelper = { registerListeners };
