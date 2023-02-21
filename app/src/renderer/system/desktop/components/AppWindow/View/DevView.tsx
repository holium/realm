import { useEffect, useMemo, useRef, useState } from 'react';
import { useServices } from 'renderer/logic/store';
import { WebView } from './WebView';
import { AppWindowType } from 'os/services/shell/desktop.model';
import { genCSSVariables } from 'renderer/logic/theme';
import { observer } from 'mobx-react';

interface Props {
  appWindow: AppWindowType;
  isResizing?: boolean;
}

export const DevViewPresenter = ({ appWindow, isResizing }: Props) => {
  const [ready, setReady] = useState(false);

  const { ship, theme } = useServices();
  const webViewRef = useRef<any>(null);
  const elementRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const onStartLoading = () => {
    setLoading(true);
  };

  const onStopLoading = () => {
    setLoading(false);
  };

  const css = genCSSVariables(theme.currentTheme);

  useEffect(() => {
    const webview: any = document.getElementById(
      `${appWindow.appId}-web-webview`
    );
    webview?.addEventListener('did-start-loading', onStartLoading);
    webview?.addEventListener('did-stop-loading', onStopLoading);
    webview?.addEventListener('close', webview?.closeDevTools);
  }, []);

  // Sync ship model info into app window
  useEffect(() => {
    webViewRef.current?.addEventListener('dom-ready', () => {
      webViewRef.current?.send('load-ship', JSON.stringify(ship));
      webViewRef.current?.send('load-appWindow-id', appWindow.appId);
      setReady(true);
    });
  }, [ship, appWindow.appId]);

  useEffect(() => {
    if (ready) {
      const webview = document.getElementById(
        `${appWindow.appId}-web-webview`
      ) as Electron.WebviewTag | null;
      webview?.insertCSS(css);
      webview?.addEventListener('did-frame-finish-load', () => {
        webview?.insertCSS(css);
      });
    }
  }, [theme.currentTheme.backgroundColor, theme.currentTheme.mode, ready]);

  return useMemo(
    () => (
      <div
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          width: 'inherit',
          height: 'inherit',
        }}
        ref={elementRef}
      >
        <WebView
          ref={webViewRef}
          id={`${appWindow.appId}-web-webview`}
          appId={appWindow.appId}
          src={appWindow.href?.site}
          partition={'persist:dev-webview'}
          webpreferences="sandbox=false"
          isLocked={isResizing || loading}
          style={{
            width: 'inherit',
            height: '100%',
            position: 'relative',
          }}
        />
      </div>
    ),
    [appWindow.href?.site, isResizing, loading, theme.currentTheme]
  );
};

export const DevView = observer(DevViewPresenter);
