import { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { WindowModelType } from 'renderer/logic/desktop/store';
import { nativeApps } from 'renderer/apps';
import { useMst } from 'renderer/logic/store';

export interface WebviewProps {
  window: WindowModelType | any;
  isResizing?: boolean;
  hasTitlebar: boolean | undefined;
}

const View = styled.div<{ hasTitleBar?: boolean }>``;

export const WebView: FC<WebviewProps> = (props: WebviewProps) => {
  const { window, isResizing } = props;
  const { desktopStore, themeStore } = useMst();
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
      webview!.send('mouse-color', desktopStore.mouseColor);
      let css = '* { cursor: none !important; }';
      webview!.insertCSS(css);
      // webview!.openDevTools();
    });

    webview?.addEventListener('close', () => {
      // @ts-ignore
      webview!.closeDevTools();
    });
  }, []);

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
        partition="web-webview"
        preload={`file://${desktopStore.appviewPreload}`}
        src={webData.url}
        onMouseEnter={() => desktopStore.setIsMouseInWebview(true)}
        onMouseLeave={() => desktopStore.setIsMouseInWebview(false)}
        style={{
          width: 'inherit',
          height: '100%',
          position: 'relative',
          pointerEvents: isResizing || loading ? 'none' : 'auto',
        }}
      />
    </View>
  );
};
