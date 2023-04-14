import { useRef, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { applyStyleOverrides } from './applyStyleOverrides';
import { genCSSVariables } from 'renderer/logic/theme';
import { WebView } from './WebView';
import { useShipStore } from 'renderer/stores/ship.store';
import { useAppState } from 'renderer/stores/app.store';
import { AppType } from 'renderer/stores/models/bazaar.model';

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
  const { theme, shellStore } = useAppState();
  const { ship, spacesStore, bazaarStore } = useShipStore();
  const [ready, setReady] = useState(false);
  const webViewRef = useRef<HTMLWebViewElement>(null);

  const [appUrl, setAppUrl] = useState<string | null>(null);

  const app = bazaarStore.getApp(appWindow.appId) as AppType;
  const isActive = shellStore.getWindowByAppId(appWindow.appId)?.isActive;

  const [loading, setLoading] = useState(true);

  const onStartLoading = () => setLoading(true);

  const onStopLoading = () => setLoading(false);

  const lockView = useMemo(
    () => isResizing || isDragging || loading || !isActive,
    [isResizing, isDragging, loading, isActive]
  );
  console.log(appWindow);
  useEffect(() => {
    const webView: Electron.WebviewTag = document.getElementById(
      `${appWindow.appId}-urbit-webview`
    ) as Electron.WebviewTag;

    if (appWindow && ship && webView) {
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
        webView.insertCSS(css);
        webView.send('mouse-color', shellStore.mouseColor);
      });
      webView.addEventListener('dom-ready', () => {
        webView.insertCSS(css);
        webView.send('mouse-color', shellStore.mouseColor);
        setReady(true);
      });

      webView.addEventListener('close', () => {
        webView.closeDevTools();
      });

      let appUrl = `${ship.url}/apps/${appWindow.appId}/?spaceId=${spacesStore.selected?.path}`;

      if (appWindow.href?.site) {
        appUrl = `${ship.url}${appWindow.href?.site}?spaceId=${spacesStore.selected?.path}`;
      }

      shellStore.openWindow(toJS(app));
      setAppUrl(appUrl);
    }

    () => {
      setReady(false);
    };
  }, [
    ship,
    appWindow,
    spacesStore.selected?.path,
    shellStore.mouseColor,
    theme.backgroundColor,
    theme.mode,
  ]);

  // Set mouse color
  useEffect(() => {
    if (ready) {
      const webView: Electron.WebviewTag = document.getElementById(
        `${appWindow.appId}-urbit-webview`
      ) as Electron.WebviewTag;

      webView?.send('mouse-color', shellStore.mouseColor);
    }
  }, [shellStore.mouseColor, ready]);

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
        <WebView
          innerRef={webViewRef}
          id={`${appWindow.appId}-urbit-webview`}
          appId={appWindow.appId}
          partition="urbit-webview"
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
    [lockView, appWindow.appId, appUrl]
  );
};

export const AppView = observer(AppViewPresenter);
