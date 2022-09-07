import { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { nativeApps } from 'renderer/apps';
import { useServices } from 'renderer/logic/store';
import { lighten } from 'polished';

export interface WebviewProps {
  window: any;
  isResizing?: boolean;
  hasTitlebar: boolean | undefined;
}

const View = styled.div<{ hasTitleBar?: boolean }>``;

export const WebView: FC<WebviewProps> = (props: WebviewProps) => {
  const { window, isResizing } = props;
  const { shell, ship, desktop } = useServices();
  const webViewRef = useRef<any>(null);
  const elementRef = useRef(null);

  const webData: any = nativeApps[window.id].web;
  const [loading, setLoading] = useState(false);

  const onStartLoading = () => {
    setLoading(true);
  };

  const onStopLoading = () => {
    setLoading(false);
  };

  useEffect(() => {
    const webview: any = document.getElementById(`${window.id}-web-webview`);
    webview?.addEventListener('did-start-loading', onStartLoading);
    webview?.addEventListener('did-stop-loading', onStopLoading);
    webview?.addEventListener('did-finish-load', () => {
      webview!.send('mouse-color', desktop.mouseColor);
      let css = '* { cursor: none !important; }';
      webview!.insertCSS(css);
    });

    webview?.addEventListener('close', () => {
      // @ts-ignore
      webview!.closeDevTools();
    });
  }, []);

  // Sync ship model info into app window
  useEffect(() => {
    webViewRef.current?.addEventListener('dom-ready', () => {
      webViewRef.current?.send('load-ship', JSON.stringify(ship));
      webViewRef.current?.send('load-window-id', window.id);
    });
  }, [ship, window.id]);

  return (
    <View
      style={{
        overflowY: 'scroll',
        overflowX: 'hidden',
        width: 'inherit',
        height: 'inherit',
      }}
      ref={elementRef}
    >
      <webview
        ref={webViewRef}
        id={`${window.id}-web-webview`}
        partition={webData.development ? 'persist:dev-webview' : 'web-webview'}
        preload={`file://${desktop.appviewPreload}`}
        src={webData.url}
        webpreferences="sandbox=false"
        onMouseEnter={() => shell.setIsMouseInWebview(true)}
        onMouseLeave={() => shell.setIsMouseInWebview(false)}
        style={{
          background: lighten(0.04, desktop.theme.windowColor),
          width: 'inherit',
          height: '100%',
          position: 'relative',
          pointerEvents: isResizing || loading ? 'none' : 'auto',
        }}
      />
    </View>
  );
};
