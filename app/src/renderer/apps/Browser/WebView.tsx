import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useServices } from 'renderer/logic/store';
import { useBrowser } from './store';

type Props = {
  isLocked: boolean;
};

export const WebView = observer(({ isLocked }: Props) => {
  const { currentTab, setCurrentTab } = useBrowser();
  const { shell } = useServices();

  useEffect(() => {
    const webView = document.getElementById(
      currentTab.id
    ) as Electron.WebviewTag;

    if (!webView) return;

    webView.addEventListener('did-navigate', (e) => {
      setCurrentTab(e.url);
    });
  }, [currentTab.url, currentTab.id]);

  const onMouseEnter = useCallback(() => {
    shell.setIsMouseInWebview(true);
  }, [shell]);

  const onMouseLeave = useCallback(() => {
    shell.setIsMouseInWebview(false);
  }, [shell]);

  return useMemo(
    () => (
      <webview
        id={currentTab.id}
        src={currentTab.url}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        partition="browser-webview"
        // This enables cursor injection, but it also crashes the webview on navigation.
        // webpreferences="sandbox=false"
        // preload={`file://${desktop.appviewPreload}`}
        // @ts-expect-error
        enableblinkfeatures="PreciseMemoryInfo, CSSVariables, AudioOutputDevices, AudioVideoTracks"
        useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0"
        style={{
          background: 'white',
          width: 'inherit',
          height: 'calc(100% - 50px)',
          position: 'relative',
          marginTop: 50,
          pointerEvents: isLocked ? 'none' : 'auto',
        }}
      />
    ),
    [currentTab.url, currentTab.id, isLocked]
  );
});
