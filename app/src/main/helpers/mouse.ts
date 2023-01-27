import { BrowserWindow, ipcMain } from 'electron';
import { WebViewsData } from 'main/main';
import { Vec2, MouseState } from 'renderer/system/mouse/AnimatedCursor';

const registerListeners = (
  webViews: WebViewsData,
  mouseOverlay: BrowserWindow
) => {
  ipcMain.handle('mouse-entered-webview', (_, id: string) => {
    webViews[id].hasMouseInside = true;
  });

  ipcMain.handle('mouse-left-webview', (_, id: string) => {
    webViews[id].hasMouseInside = false;
  });

  ipcMain.handle(
    'mouse-move',
    (_, position: Vec2, state: MouseState, isWebview: boolean) => {
      if (isWebview) {
        const activeWebviewPosition = Object.values(webViews).find(
          (webView) => webView.hasMouseInside
        )?.position;
        if (!activeWebviewPosition) return;
        const absolutePosition = {
          x: activeWebviewPosition.x + position.x,
          y: activeWebviewPosition.y + position.y,
        };
        mouseOverlay.webContents.send('mouse-move', absolutePosition, state);
      } else {
        mouseOverlay.webContents.send('mouse-move', position, state);
      }
    }
  );

  ipcMain.handle('mouse-down', () => {
    mouseOverlay.webContents.send('mouse-down');
  });

  ipcMain.handle('mouse-up', () => {
    mouseOverlay.webContents.send('mouse-up');
  });
};

export default { registerListeners };
