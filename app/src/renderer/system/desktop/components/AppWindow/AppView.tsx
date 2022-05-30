import { FC, useRef, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useMst, useShip } from 'renderer/logic/store';
import { Spinner, Flex } from 'renderer/components';
import { WebTermCSS } from 'renderer/apps/WebTerm/WebTerm.styles';
import { WindowModelType } from 'renderer/logic/desktop/store';
import { toJS } from 'mobx';

interface AppViewProps {
  window: WindowModelType;
  isResizing: boolean;
  hasTitlebar: boolean;
}

const View = styled.div<{ hasTitleBar?: boolean }>`
  transform: translateZ(0);
`;

export const AppView: FC<AppViewProps> = (props: AppViewProps) => {
  const { isResizing, window } = props;
  const { ship } = useShip();
  const { desktopStore, themeStore } = useMst();
  const elementRef = useRef(null);
  const webViewRef = useRef<any>(null);

  const activeWindow = window;

  const [appConfig, setAppConfig] = useState<any>({
    name: null,
    url: null,
    customCSS: WebTermCSS,
    cookies: { url: null, name: null, value: null },
  });

  const [loading, setLoading] = useState(false);

  const onStartLoading = () => {
    setLoading(true);
  };

  const onStopLoading = () => {
    setLoading(false);
  };

  useEffect(() => {
    const webview: any = document.getElementById(
      `${activeWindow.id}-app-webview`
    );
    webview?.addEventListener('did-start-loading', onStartLoading);
    webview?.addEventListener('did-stop-loading', onStopLoading);

    if (activeWindow && ship) {
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
      const location = desktopStore.openBrowserWindow(toJS(activeWindow));
      setAppConfig(location);
    }
  }, [activeWindow?.id, ship]);

  return useMemo(
    () => (
      <View
        style={{
          overflow: 'hidden',
          width: 'inherit',
          height: 'inherit',
        }}
        ref={elementRef}
      >
        {loading && (
          <Flex
            position="absolute"
            left="calc(50% - 4px)"
            top="calc(50% - 4px)"
          >
            <Spinner size={1} />
          </Flex>
        )}
        <webview
          ref={webViewRef}
          id={`${activeWindow.id}-app-webview`}
          partition="app-webview"
          preload={`file://${desktopStore.appviewPreload}`}
          src={appConfig.url}
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
    ),
    [loading, activeWindow.id, appConfig.url, ship?.url, isResizing]
  );
};
