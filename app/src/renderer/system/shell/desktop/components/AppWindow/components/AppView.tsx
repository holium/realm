import { FC, useRef, useEffect, useState, createRef } from 'react';
import styled, { css } from 'styled-components';
import { useMst, useShip } from '../../../../../../logic/store';
import { Spinner, Flex } from '../../../../../../components';
import { WebTermCSS } from '../../../../../../system/apps/WebTerm/WebTerm.styles';
import { WindowModelType } from 'renderer/logic/desktop/store';

interface AppViewProps {
  window: WindowModelType;
  isResizing: boolean;
  hasTitlebar: boolean;
}
// height: ${(props: any) =>
//   props.hasTitleBar ? 'calc(100% - 50px)' : 'inherit'};
// height: ${(props: any) =>
//   props.hasTitleBar ? 'calc(100% - 30px)' : 'inherit'};
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
    const webview: any = document.getElementById('app-webview');
    webview?.addEventListener('did-start-loading', onStartLoading);
    webview?.addEventListener('did-stop-loading', onStopLoading);

    if (activeWindow) {
      // const config = divElement!.getBoundingClientRect();
      const formAppUrl = `${ship!.url}/apps/${activeWindow!.id}`;
      const location = {
        title: activeWindow.title,
        id: activeWindow.id,
        url: formAppUrl,
        customCSS: {},
        cookies: {
          url: formAppUrl,
          name: `urbauth-${ship!.patp}`,
          value: ship!.cookie!.split('=')[1].split('; ')[0],
        },
      };

      webview?.addEventListener('dom-ready', () => {
        webview!.send('mouse-color', themeStore.mouseColor);

        // @ts-ignore
        // webview!.isDevToolsOpened() && webview!.closeDevTools();
        // @ts-ignore
        // webview!.openDevTools();
        // webview.executre
        let css = '* { cursor: none !important; }';
        webview!.insertCSS(css);
      });
      webview?.addEventListener('close', () => {
        // @ts-ignore
        // webview!.closeDevTools();
      });
      desktopStore.openBrowserWindow(activeWindow, location);
      setAppConfig(location);
    }
  }, [activeWindow?.id]);

  return (
    <View
      style={{
        overflow: 'hidden',
        width: 'inherit',
        height: 'inherit',
      }}
      ref={elementRef}
    >
      {loading && (
        <Flex position="absolute" left="calc(50% - 4px)" top="calc(50% - 4px)">
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
          pointerEvents: isResizing ? 'none' : 'auto',
        }}
      />
    </View>
  );
};
