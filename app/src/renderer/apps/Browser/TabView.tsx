import { FC, useEffect, useCallback, useRef, useState, useMemo } from 'react';
import styled from 'styled-components';

import { TitlebarStyle } from 'renderer/system/desktop/components/AppWindow/Titlebar';
import { Flex, Spinner, Input } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { useBrowser } from './store';

// const ToolbarStyle = styled(TitlebarStyle)`
//   /* height: 42px; */
//   padding: 0 10px;
//   background: transparent;
//   gap: 12px;
// `;
const View = styled.div<{ hasTitleBar?: boolean }>`
  transform: translateZ(0);
`;
export type BrowserTabProps = {
  tab: any;
  isResizing?: boolean;
};

export const TabView: FC<BrowserTabProps> = (props: BrowserTabProps) => {
  const { tab, isResizing } = props;
  const elementRef = useRef(null);
  const webViewRef = useRef<any>(null);
  const { shell } = useServices();
  const { desktop, theme } = shell;
  const browserStore = useBrowser();
  const { iconColor } = theme.theme;

  const [loading, setLoading] = useState(false);
  // const [urlData, setUrlData] = useState<any>(tab ? new URL(tab.url) : null);
  // const [protocol, setProtocol] = useState(
  //   tab.url ? currentUrlData.protocol.slice(0, -1) : ''
  // );

  const onStartLoading = () => {
    setLoading(true);
  };

  const onStopLoading = () => {
    setLoading(false);
  };
  const lockView = useMemo(() => isResizing || loading, [isResizing, loading]);
  useEffect(() => {
    const webview: any = document.getElementById(`${tab.id}-browser-webview`);
    webview?.addEventListener('did-start-loading', onStartLoading);
    webview?.addEventListener('did-stop-loading', onStopLoading);

    webview?.addEventListener('did-finish-load', () => {
      webview!.send('mouse-color', desktop.mouseColor, true);
      let css = '* { cursor: none !important; }';

      webview!.insertCSS(css);
      // webview.setUserAgent(
      //   'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36'
      // );
      // webview!.openDevTools();
    });
    webview.addEventListener('will-navigate', async (e: any) => {
      const newUrl = new URL(e.url);
      // setUrlData(newUrl);
      // console.log(newUrl);
    });

    // webview?.addEventListener('dom-ready', () => {
    //   setLoading(true);
    // });

    webview?.addEventListener('close', () => {
      // @ts-ignore
      webview!.closeDevTools();
    });
  }, [tab.url]);

  const onMouseEnter = useCallback(() => {
    desktop.setIsMouseInWebview(true);
  }, [desktop]);
  const onMouseLeave = useCallback(() => {
    desktop.setIsMouseInWebview(false);
  }, [desktop]);

  return useMemo(() => {
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
          id={`${tab.id}-browser-webview`}
          src={tab.url}
          partition="browser-webview"
          preload={`file://${desktop.appviewPreload}`}
          onLoad={() => console.log('loaded')}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36"
          style={{
            width: 'inherit',
            height: 'calc(100% - 50px)',
            position: 'relative',
            marginTop: 50,
            pointerEvents: lockView ? 'none' : 'auto',
          }}
        />
      </View>
    );
  }, [lockView, window.id, tab.url]);
};
