import { FC, useEffect, useCallback, useRef, useState, useMemo } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';

import { Flex, Spinner } from 'renderer/components';
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
export interface BrowserTabProps {
  isResizing?: boolean;
}

export const TabView: FC<BrowserTabProps> = observer(
  (props: BrowserTabProps) => {
    const { isResizing } = props;
    const elementRef = useRef(null);
    const webViewRef = useRef<any>(null);
    const { desktop, shell } = useServices();
    const { currentTab, setCurrentTab } = useBrowser();
    const tabId = `${currentTab.id}-browser-webview`;

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
    const lockView = useMemo(
      () => isResizing || loading,
      [isResizing, loading]
    );
    useEffect(() => {
      const webview: any = document.getElementById(tabId);
      webview?.addEventListener('did-start-loading', onStartLoading);
      webview?.addEventListener('did-stop-loading', onStopLoading);
      webview?.addEventListener('load-commit', () => {
        // Sets the z-index to a reasonable number
        const elms = webview.querySelectorAll('div[style]');

        // Loop through them
        Array.prototype.forEach.call(elms, function (elm) {
          console.log(elm);
          if (elm.style.zIndex === 2147483647) {
            console.log('is tlon shit');
          }
        });
      });
      webview?.addEventListener('did-finish-load', () => {
        webview.send('mouse-color', desktop.mouseColor, true);
        const css = '* { cursor: none !important; }';

        webview.insertCSS(css);
        // webview.setUserAgent(
        //   'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36'
        // );
        // webview!.openDevTools();
      });
      webview.addEventListener('will-navigate', async (e: any) => {
        const newUrl = new URL(e.url);
        console.log('setting url: ', newUrl);
        setCurrentTab(newUrl.toString());
        // setUrlData(newUrl);
        console.log(newUrl);
      });

      // webview?.addEventListener('dom-ready', () => {
      //   setLoading(true);
      // });

      webview?.addEventListener('close', () => {
        // @ts-expect-error
        webview.closeDevTools();
      });
    }, [currentTab.url]);

    const onMouseEnter = useCallback(() => {
      shell.setIsMouseInWebview(true);
    }, [shell]);
    const onMouseLeave = useCallback(() => {
      shell.setIsMouseInWebview(false);
    }, [shell]);

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
          <webview
            ref={webViewRef}
            id={tabId}
            src={currentTab.url}
            partition="browser-webview"
            preload={`file://${desktop.appviewPreload}`}
            onLoad={() => console.log('loaded')}
            webpreferences="sandbox=false"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            // allowpopups="true"
            // @ts-expect-error
            enableblinkfeatures="PreciseMemoryInfo, CSSVariables, AudioOutputDevices, AudioVideoTracks"
            useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0"
            style={{
              background: 'white',
              width: 'inherit',
              height: 'calc(100% - 50px)',
              position: 'relative',
              marginTop: 50,
              pointerEvents: lockView ? 'none' : 'auto',
            }}
          />
          {loading && (
            <Flex
              position="absolute"
              left="calc(50% - 4px)"
              top="calc(50% - 4px)"
            >
              <Spinner size={1} />
            </Flex>
          )}
        </View>
      );
    }, [loading, lockView, window.id, currentTab.url]);
  }
);
