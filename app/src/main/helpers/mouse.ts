import { BrowserWindow, ipcMain, screen } from 'electron';
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
    const mouseWindowPosition = mouseWindow.getPosition();
    const webContentsPosition = {
      x: screenPosition.x - mouseWindowPosition[0],
      y: screenPosition.y - mouseWindowPosition[1],
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

  ipcMain.handle('icon', (_, icon: string) => {
    console.log('ipcMain event');
    console.log(icon);
    mouseWindow.webContents.send('icon', icon);
  });

  ipcMain.handle('drop', () => {
    console.log('drop event');
    mouseWindow.webContents.send('drop');
  });
};

export const MouseHelper = { registerListeners };
