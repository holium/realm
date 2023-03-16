import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Text } from 'renderer/components';
import { useBrowser } from './store';
import { WebView } from 'renderer/system/desktop/components/AppWindow/View/WebView';

type Props = {
  isDragging: boolean;
  isResizing: boolean;
};

const appId = 'os-browser';

const BrowserWebviewPresenter = ({ isDragging, isResizing }: Props) => {
  const { currentTab, setUrl, setLoading, setLoaded, setError } = useBrowser();
  const [readyWebview, setReadyWebview] = useState<Electron.WebviewTag>();

  const loadingState = useMemo(
    () => currentTab.loader.state,
    [currentTab.loader.state]
  );

  useEffect(() => {
    const webview = document.getElementById(
      currentTab.id
    ) as Electron.WebviewTag | null;

    if (!webview) return;

    const onDomReady = () => setReadyWebview(webview);

    webview.addEventListener('dom-ready', onDomReady);

    return () => {
      webview.removeEventListener('dom-ready', onDomReady);
    };
  }, [currentTab.id]);

  useEffect(() => {
    if (!readyWebview) return;

    const onDidStartLoading = setLoading;
    const onDidStopLoading = setLoaded;
    const onDidNavigate = (e: Electron.DidNavigateEvent) => setUrl(e.url);
    const onDidNavigateInPage = (e: Electron.DidNavigateInPageEvent) =>
      setUrl(e.url);
    const onDidFailLoad = (e: Electron.DidFailLoadEvent) => {
      // Error code 3 is a bug and not a terminal error.
      if (e.errorCode !== -3) setError();
    };

    readyWebview.addEventListener('did-start-loading', onDidStartLoading);
    readyWebview.addEventListener('did-stop-loading', onDidStopLoading);
    readyWebview.addEventListener('did-navigate', onDidNavigate);
    readyWebview.addEventListener('did-navigate-in-page', onDidNavigateInPage);
    readyWebview.addEventListener('did-fail-load', onDidFailLoad);

    return () => {
      readyWebview.removeEventListener('did-start-loading', onDidStartLoading);
      readyWebview.removeEventListener('did-stop-loading', onDidStopLoading);
      readyWebview.removeEventListener('did-navigate', onDidNavigate);
      readyWebview.removeEventListener(
        'did-navigate-in-page',
        onDidNavigateInPage
      );
      readyWebview.removeEventListener('did-fail-load', onDidFailLoad);
    };
  }, []);

  return useMemo(
    () => (
      <>
        {loadingState === 'error' ? (
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
            id={currentTab.id}
            appId={appId}
            src={currentTab.url}
            // @ts-expect-error
            enableblinkfeatures="PreciseMemoryInfo, CSSVariables, AudioOutputDevices, AudioVideoTracks"
            useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0"
            partition="browser-webview"
            isLocked={isDragging || isResizing || loadingState === 'loading'}
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
    [currentTab.url, isDragging, isResizing, loadingState]
  );
};

export const BrowserWebview = observer(BrowserWebviewPresenter);
