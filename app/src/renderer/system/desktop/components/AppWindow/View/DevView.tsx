import { useEffect, useMemo, useState } from 'react';
import { useServices } from 'renderer/logic/store';
import { lighten, darken } from 'polished';
import { WebView } from './WebView';
import { AppWindowType } from 'os/services/shell/desktop.model';
import { observer } from 'mobx-react';
import { useToggle } from 'renderer/logic/lib/useToggle';
import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { RoomManagerEvent, RoomsManager } from '@holium/realm-room';

const connectWebviewToMultiplayer = async (
  ship: string,
  roomsManager: RoomsManager,
  webview: Electron.WebviewTag
) => {
  console.log('Connecting webview to multiplayer.');

  roomsManager.on(
    RoomManagerEvent.OnDataChannel,
    async (_rid: string, _peer: string, { value }) => {
      if (!value) return;

      if (value.cursor && value.cursor.event === 'mouse-click') {
        const { patp, elementId } = value.cursor;
        webview.send('multiplayer.realm-to-app.mouse-click', patp, elementId);
      } else if (value.transaction) {
        const { patp, version, steps, clientID } = value.transaction;
        webview.send(
          'multiplayer.realm-to-app.send-transaction',
          patp,
          version,
          steps,
          clientID
        );
      } else if (value.caret) {
        const { patp, position } = value.caret;
        webview.send('multiplayer.realm-to-app.send-caret', patp, position);
      }
    }
  );

  webview.executeJavaScript(`
    window.ship = '${ship}';
  `);
};

type Props = {
  appWindow: AppWindowType;
  isResizing: boolean;
};

const DevViewPresenter = ({ appWindow, isResizing }: Props) => {
  const { theme, ship } = useServices();
  const roomsManager = useRooms();

  const loading = useToggle(false);
  const [readyWebview, setReadyWebview] = useState<Electron.WebviewTag>();

  const currentTheme = useMemo(() => theme.currentTheme, [theme.currentTheme]);
  const webviewId = useMemo(
    () => `${appWindow.appId}-web-webview`,
    [appWindow.appId]
  );
  const themeCss = useMemo(
    () => `
      :root {
        --rlm-font: 'Rubik', sans-serif;
        --rlm-base-color: ${currentTheme.backgroundColor};
        --rlm-accent-color: ${currentTheme.accentColor};
        --rlm-input-color: ${currentTheme.inputColor};
        --rlm-border-color: ${
          currentTheme.mode === 'light'
            ? darken(0.1, currentTheme.windowColor)
            : darken(0.075, currentTheme.windowColor)
        };
        --rlm-window-color: ${currentTheme.windowColor};
        --rlm-card-color: ${
          currentTheme.mode === 'light'
            ? lighten(0.05, currentTheme.windowColor)
            : darken(0.025, currentTheme.windowColor)
        };
        --rlm-theme-mode: ${currentTheme.mode};
        --rlm-text-color: ${currentTheme.textColor};
        --rlm-icon-color: ${currentTheme.iconColor};
      }
      div[data-radix-portal] {
        z-index: 2000 !important;
      }

      #rlm-cursor {
        position: absolute;
        z-index: 2147483646 !important;
      }
    `,
    [currentTheme]
  );

  useEffect(() => {
    const webview = document.getElementById(
      webviewId
    ) as Electron.WebviewTag | null;

    if (!webview || !ship || !roomsManager) return;

    const onDomReady = () => {
      setReadyWebview(webview);
      connectWebviewToMultiplayer(ship.patp, roomsManager, webview);
    };

    webview.addEventListener('dom-ready', onDomReady);

    return () => {
      webview.removeEventListener('dom-ready', onDomReady);
    };
  }, [appWindow.appId, ship, roomsManager]);

  useEffect(() => {
    if (!readyWebview) return;

    const onDidFrameFinishLoad = () => readyWebview.insertCSS(themeCss);

    readyWebview.addEventListener(
      'did-frame-finish-load',
      onDidFrameFinishLoad
    );
    readyWebview.addEventListener('did-start-loading', loading.toggleOn);
    readyWebview.addEventListener('did-stop-loading', loading.toggleOff);
    readyWebview.addEventListener('close', readyWebview.closeDevTools);

    return () => {
      readyWebview.removeEventListener(
        'did-frame-finish-load',
        onDidFrameFinishLoad
      );
      readyWebview.removeEventListener('did-start-loading', loading.toggleOn);
      readyWebview.removeEventListener('did-stop-loading', loading.toggleOff);
      readyWebview.removeEventListener('close', readyWebview.closeDevTools);
    };
  }, [readyWebview, themeCss, ship, loading]);

  return useMemo(
    () => (
      <div
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          width: 'inherit',
          height: 'inherit',
        }}
      >
        <WebView
          id={webviewId}
          appId={appWindow.appId}
          src={appWindow.href?.site}
          partition="persist:dev-webview"
          webpreferences="sandbox=false"
          isLocked={isResizing || loading.isOn}
          style={{
            background: lighten(0.04, currentTheme.windowColor),
            width: 'inherit',
            height: '100%',
            position: 'relative',
          }}
        />
      </div>
    ),
    [
      appWindow.appId,
      appWindow.href?.site,
      isResizing,
      loading.isOn,
      currentTheme.windowColor,
    ]
  );
};

export const DevView = observer(DevViewPresenter);
