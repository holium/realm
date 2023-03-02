import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Text } from 'renderer/components';
import { useBrowser } from './store';
import { WebView } from 'renderer/system/desktop/components/AppWindow/View/WebView';

type Props = {
  isDragging: boolean;
  isResizing: boolean;
};

const BrowserWebviewPresenter = ({ isDragging, isResizing }: Props) => {
  const { currentTab, setUrl, setLoading, setLoaded, setError } = useBrowser();

  const appId = 'os-browser';
  const webViewId = `${appId}-web-webview`;
  const { loader } = currentTab;

  useEffect(() => {
    const webView = document.getElementById(
      webViewId
    ) as Electron.WebviewTag | null;

    if (!webView) return;

    const onDidStartLoading = setLoading;
    const onDidStopLoading = setLoaded;
    const onDidNavigate = (e: Electron.DidNavigateEvent) => setUrl(e.url);
    const onDidNavigateInPage = (e: Electron.DidNavigateInPageEvent) =>
      setUrl(e.url);
    const onDidFailLoad = (e: Electron.DidFailLoadEvent) => {
      // Error code 3 is a bug and not a terminal error.
      const isLinux = process.platform === 'linux';
      if (e.errorCode !== -3 && !isLinux) setError();
    };

    webView.addEventListener('did-start-loading', onDidStartLoading);
    webView.addEventListener('did-stop-loading', onDidStopLoading);
    webView.addEventListener('did-navigate', onDidNavigate);
    webView.addEventListener('did-navigate-in-page', onDidNavigateInPage);
    webView.addEventListener('did-fail-load', onDidFailLoad);

    return () => {
      webView.removeEventListener('did-start-loading', onDidStartLoading);
      webView.removeEventListener('did-stop-loading', onDidStopLoading);
      webView.removeEventListener('did-navigate', onDidNavigate);
      webView.removeEventListener('did-navigate-in-page', onDidNavigateInPage);
      webView.removeEventListener('did-fail-load', onDidFailLoad);
    };
  }, [webViewId]);

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
            id={webViewId}
            appId={appId}
            src={currentTab.url}
            // @ts-expect-error
            enableblinkfeatures="PreciseMemoryInfo, CSSVariables, AudioOutputDevices, AudioVideoTracks"
            useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0"
            partition="browser-webview"
            isLocked={isDragging || isResizing || loader.state === 'loading'}
            style={{
              background: 'white',
              width: '100%',
              height: 'calc(100% - 54px)',
              marginTop: 54,
            }}
          />
        )}
      </>
    ),
    [currentTab.url, isDragging, isResizing, loader.state, webViewId]
  );
};

export const BrowserWebview = observer(BrowserWebviewPresenter);
