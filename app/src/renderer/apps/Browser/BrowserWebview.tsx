import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Text } from 'renderer/components';
import { useBrowser } from './store';
import { WebView } from 'renderer/system/desktop/components/Window/WebView';
import { useToggle } from 'renderer/logic/lib/useToggle';

type Props = {
  isLocked: boolean;
};

export const BrowserWebview = observer(({ isLocked }: Props) => {
  const { currentTab, setUrl, setLoading, setLoaded, setError } = useBrowser();
  const hidden = useToggle(true);

  const id = 'os-browser-web-webview';
  const { loader } = currentTab;

  useEffect(() => {
    const webView = document.getElementById(id) as Electron.WebviewTag | null;

    if (!webView) return;

    // On first load, we want to hide the webview until it's loaded.
    // This is to wait for the webview coordinates to be sent to the main process.
    webView.addEventListener('dom-ready', hidden.toggleOff);

    webView.addEventListener('did-start-loading', () => {
      setLoading();
    });
    webView.addEventListener('did-stop-loading', () => {
      setLoaded();
    });
    webView.addEventListener('did-navigate', (e) => {
      setUrl(e.url);
    });
    // Account for SPA navigation.
    webView.addEventListener('did-navigate-in-page', (e) => {
      setUrl(e.url);
    });
    webView.addEventListener('did-fail-load', (e) => {
      // Error code 3 is a bug and not a terminal error.
      if (e.errorCode !== -3) setError();
    });
  }, [id]);

  return useMemo(
    () => (
      <>
        {loader.state === 'error' ? (
          <Text
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 20,
              fontWeight: 500,
              zIndex: 1,
            }}
          >
            Failed to load.
          </Text>
        ) : (
          <WebView
            id={id}
            src={currentTab.url}
            // @ts-expect-error
            enableblinkfeatures="PreciseMemoryInfo, CSSVariables, AudioOutputDevices, AudioVideoTracks"
            useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0"
            partition="browser-webview"
            style={{
              background: 'white',
              width: '100%',
              height: 'calc(100% - 54px)',
              marginTop: 54,
              // Hide the webview until it's loaded.
              visibility: hidden.isOn ? 'hidden' : 'visible',
            }}
          />
        )}
      </>
    ),
    [currentTab.id, currentTab.url, isLocked, loader.state]
  );
});
