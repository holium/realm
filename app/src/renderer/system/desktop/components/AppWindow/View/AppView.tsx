import { useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Flex, Spinner } from '@holium/design-system';
import { genCSSVariables } from '@holium/shared';

// import { AppType } from 'renderer/stores/models/bazaar.model';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { applyStyleOverrides } from './applyStyleOverrides';
import { WebView } from './WebView';

const AppViewContainer = styled.div`
  overflow: hidden;
  width: inherit;
  height: inherit;
  position: relative;
`;

type Props = {
  appWindow: any;
  isResizing: boolean;
  isDragging: boolean;
};

const AppViewPresenter = ({ isResizing, isDragging, appWindow }: Props) => {
  const { loggedInAccount, theme, shellStore } = useAppState();
  const { spacesStore } = useShipStore();
  const [ready, setReady] = useState(false);
  const webViewRef = useRef<HTMLWebViewElement>(null);

  const [appUrl, setAppUrl] = useState<string | null>(null);

  const isActive = shellStore.getWindowByAppId(appWindow.appId)?.isActive;

  const [loading, setLoading] = useState(true);

  const onStartLoading = () => setLoading(true);

  const onStopLoading = () => setLoading(false);

  const lockView = useMemo(
    () => isResizing || isDragging || loading || !isActive,
    [isResizing, isDragging, loading, isActive]
  );

  useEffect(() => {
    const webView: Electron.WebviewTag = document.getElementById(
      `${appWindow.appId}-urbit-webview`
    ) as Electron.WebviewTag;

    if (appWindow && loggedInAccount && webView) {
      webView.addEventListener('did-start-loading', onStartLoading);
      webView.addEventListener('did-stop-loading', onStopLoading);

      if (process.env.NODE_ENV === 'development') {
        webView.addEventListener(
          'console-message',
          (e: Electron.ConsoleMessageEvent) => {
            if (e.level === 3) {
              console.error(`${appWindow.appId} => `, e.message);
            }
          }
        );
      }
      const css = `
          ${genCSSVariables(theme)}
          ${applyStyleOverrides(appWindow.appId, theme)}
        `;

      webView.addEventListener('did-attach', () => {
        // webView.insertCSS(css);
        setReady(true);
      });
      webView.addEventListener('dom-ready', () => {
        webView.insertCSS(css);
      });

      webView.addEventListener('close', () => {
        webView.closeDevTools();
      });

      let appUrl = `${loggedInAccount.serverUrl}/apps/${appWindow.appId}/?spaceId=${spacesStore.selected?.path}`;

      if (appWindow.href?.glob.base) {
        appUrl = `${loggedInAccount.serverUrl}/apps/${appWindow.href?.glob.base}/?spaceId=${spacesStore.selected?.path}`;
      }
      if (appWindow.href?.site) {
        appUrl = `${loggedInAccount.serverUrl}${appWindow.href?.site}?spaceId=${spacesStore.selected?.path}`;
      }

      setAppUrl(appUrl);
    }

    () => {
      setReady(false);
    };
  }, [
    loggedInAccount,
    appWindow,
    spacesStore.selected?.path,
    shellStore.mouseColor,
    theme.backgroundColor,
    theme.mode,
  ]);

  // Set theme on change
  useEffect(() => {
    if (ready) {
      const css = `
        ${genCSSVariables(theme)}
        ${applyStyleOverrides(appWindow.appId, theme)}
      `;
      const webView: Electron.WebviewTag = document.getElementById(
        `${appWindow.appId}-urbit-webview`
      ) as Electron.WebviewTag;
      try {
        webView.insertCSS(css);
      } catch (e) {
        console.error(e);
      }
    }
  }, [theme.backgroundColor, theme.mode, ready]);

  return useMemo(
    () => (
      <AppViewContainer>
        {loading && (
          <Flex width="100%" height="100%" justify="center" align="center">
            <Spinner size={1} color="#FFF" />
          </Flex>
        )}
        <WebView
          innerRef={webViewRef}
          id={`${appWindow.appId}-urbit-webview`}
          appId={appWindow.appId}
          partition={`persist:webview-${loggedInAccount?.serverId}`}
          webpreferences="sandbox=false, nativeWindowOpen=yes"
          // @ts-ignore
          allowpopups="true"
          src={appUrl ?? ''}
          isLocked={lockView}
          style={{
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            overflow: 'hidden',
          }}
        />
      </AppViewContainer>
    ),
    [lockView, appWindow.appId, appUrl, loggedInAccount]
  );
};

export const AppView = observer(AppViewPresenter);
