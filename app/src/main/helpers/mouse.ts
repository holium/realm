import { BrowserWindow, ipcMain } from 'electron';
import { WebViewsData } from 'main/main';
import { Vec2, MouseState } from 'renderer/system/mouse/AnimatedCursor';

const registerListeners = (
  mouseWindow: BrowserWindow,
  webViews: WebViewsData
) => {
  ipcMain.handle('mouse-entered-webview', (_, id: string) => {
    webViews[id].hasMouseInside = true;
  });

  ipcMain.handle('mouse-left-webview', (_, id: string) => {
    webViews[id].hasMouseInside = false;
  });

  ipcMain.handle(
    'mouse-move',
    (
      _,
      position: Vec2,
      state: MouseState,
      isDragging: boolean,
      isWebview: boolean
    ) => {
      if (isWebview) {
        const activeWebviewPosition = Object.values(webViews).find(
          (webView) => webView.hasMouseInside
        )?.position;
        if (!activeWebviewPosition) return;
        const absolutePosition = {
          x: activeWebviewPosition.x + position.x,
          y: activeWebviewPosition.y + position.y,
        };
        mouseWindow.webContents.send(
          'mouse-move',
          absolutePosition,
          state,
          isDragging
        );
      } else {
        mouseWindow.webContents.send('mouse-move', position, state, isDragging);
      }
    }
  );

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
