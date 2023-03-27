import { useEffect, useMemo, useState } from 'react';
import { useServices } from 'renderer/logic/store';
import { WebView } from './WebView';
import { AppWindowType } from 'os/services/shell/desktop.model';
import { observer } from 'mobx-react';
import { useToggle } from '@holium/design-system';
import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { RoomManagerEvent, RoomsManager } from '@holium/realm-room';
import { genCSSVariables } from 'renderer/logic/theme';

const connectWebviewToMultiplayer = async (
  ship: string,
  roomsManager: RoomsManager,
  webview: Electron.WebviewTag
) => {
  console.log('Connecting webview to presence.');

  roomsManager.on(
    RoomManagerEvent.OnDataChannel,
    async (_rid: string, _peer: string, { value }) => {
      if (!value) return;

      if (value.multiplayer && value.multiplayer.event === 'mouse-click') {
        const { patp, elementId } = value.multiplayer;
        webview.send('multiplayer.realm-to-app.mouse-click', patp, elementId);
      } else if (value.broadcast) {
        webview.send(
          'presence.realm-to-app.broadcast',
          ...value.broadcast.data
        );
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
  const themeCss = useMemo(() => genCSSVariables(currentTheme), [currentTheme]);

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
