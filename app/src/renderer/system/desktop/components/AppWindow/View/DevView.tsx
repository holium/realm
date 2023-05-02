import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { onAction } from 'mobx-state-tree';

import { useToggle } from '@holium/design-system';

import { genCSSVariables } from 'renderer/lib/theme';
import { useAppState } from 'renderer/stores/app.store';
import { AppWindowMobxType } from 'renderer/stores/models/window.model';
import { ShipStoreInstance, useShipStore } from 'renderer/stores/ship.store';

import { WebView } from './WebView';

const connectWebviewToMultiplayer = async (
  ship: string,
  shipStore: ShipStoreInstance,
  webview: Electron.WebviewTag
) => {
  console.log('Connecting webview to presence.');
  const onDataChannel = (_rid: string, _peer: string, { value }: any) => {
    if (!value) return;
    if (value.multiplayer && value.multiplayer.event === 'mouse-click') {
      const { patp, elementId } = value.multiplayer;
      webview.send('multiplayer.realm-to-app.mouse-click', patp, elementId);
    } else if (value.broadcast) {
      webview.send('presence.realm-to-app.broadcast', ...value.broadcast.data);
    }
  };

  onAction(shipStore, (call) => {
    if (call.path === '/roomsStore') {
      if (call.name === '_onDataChannel') {
        if (call.args) {
          onDataChannel('', '', call.args[0]);
        }
      }
    }
  });

  webview.executeJavaScript(`
    window.ship = '${ship}';
  `);
};

type Props = {
  appWindow: AppWindowMobxType;
  isResizing: boolean;
};

const DevViewPresenter = ({ appWindow, isResizing }: Props) => {
  const { loggedInAccount, theme } = useAppState();
  const shipStore = useShipStore();

  const loading = useToggle(false);
  const [readyWebview, setReadyWebview] = useState<Electron.WebviewTag>();

  const currentTheme = useMemo(() => theme, [theme]);
  const webviewId = useMemo(
    () => `${appWindow.appId}-web-webview`,
    [appWindow.appId]
  );
  const themeCss = useMemo(() => genCSSVariables(currentTheme), [currentTheme]);

  useEffect(() => {
    const webview = document.getElementById(
      webviewId
    ) as Electron.WebviewTag | null;

    if (!webview || !loggedInAccount) return;

    const onDomReady = () => {
      setReadyWebview(webview);
      connectWebviewToMultiplayer(loggedInAccount.serverId, shipStore, webview);
    };

    webview.addEventListener('dom-ready', onDomReady);

    return () => {
      webview.removeEventListener('dom-ready', onDomReady);
    };
  }, [appWindow.appId, loggedInAccount, shipStore.roomsStore]);

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
  }, [readyWebview, themeCss, loggedInAccount, loading]);

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
