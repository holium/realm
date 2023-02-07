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
    const webContentsPosition = {
      x: screenPosition.x - mouseWindow.getPosition()[0],
      y: screenPosition.y - mouseWindow.getPosition()[1],
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
};

export default { registerListeners };
