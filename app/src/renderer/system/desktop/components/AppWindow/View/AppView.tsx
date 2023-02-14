import { useRef, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { AppWindowType } from 'os/services/shell/desktop.model';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { applyStyleOverrides } from './applyStyleOverrides';
import { genCSSVariables } from 'renderer/logic/theme';
import { WebView } from './WebView';
import { AppType } from 'os/services/spaces/models/bazaar';

const AppViewContainer = styled.div`
  overflow: hidden;
  width: inherit;
  height: inherit;
  position: relative;
`;

type Props = {
  appWindow: AppWindowType;
  isResizing: boolean;
  isDragging: boolean;
};

const AppViewPresenter = ({ isResizing, isDragging, appWindow }: Props) => {
  const { ship, desktop, theme, spaces, bazaar } = useServices();
  const [ready, setReady] = useState(false);
  const webViewRef = useRef<HTMLWebViewElement>(null);

  const [appUrl, setAppUrl] = useState<string | null>(null);

  const app = bazaar.getApp(appWindow.appId) as AppType;
  const isActive = desktop.getWindowByAppId(appWindow.appId)?.isActive;

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
          ${genCSSVariables(theme.currentTheme)}
          ${applyStyleOverrides(appWindow.appId, theme.currentTheme)}
        `;

      webView.addEventListener('did-attach', () => {
        webView.insertCSS(css);
        webView.send('mouse-color', desktop.mouseColor);
      });
      webView.addEventListener('dom-ready', () => {
        webView.insertCSS(css);
        webView.send('mouse-color', desktop.mouseColor);
        setReady(true);
      });

      webView.addEventListener('close', () => {
        webView.closeDevTools();
      });

      let appUrl = `${ship.url}/apps/${appWindow.appId}/?spaceId=${spaces.selected?.path}`;

      if (appWindow.href?.site) {
        appUrl = `${ship.url}${appWindow.href?.site}?spaceId=${spaces.selected?.path}`;
      }

      DesktopActions.openAppWindow(toJS(app));
      setAppUrl(appUrl);
    }

    () => {
      setReady(false);
    };
  }, [
    ship,
    appWindow,
    spaces.selected?.path,
    desktop.mouseColor,
    theme.currentTheme.backgroundColor,
    theme.currentTheme.mode,
  ]);

  // Set mouse color
  useEffect(() => {
    if (ready) {
      const webView: Electron.WebviewTag = document.getElementById(
        `${appWindow.appId}-urbit-webview`
      ) as Electron.WebviewTag;

      webView?.send('mouse-color', desktop.mouseColor);
    }
  }, [desktop.mouseColor, ready]);

  // Set theme on change
  useEffect(() => {
    if (ready) {
      const css = `
        ${genCSSVariables(theme.currentTheme)}
        ${applyStyleOverrides(appWindow.appId, theme.currentTheme)}
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
  }, [theme.currentTheme.backgroundColor, theme.currentTheme.mode, ready]);

  return useMemo(
    () => (
      <AppViewContainer>
        <WebView
          innerRef={webViewRef}
          id={`${appWindow.appId}-urbit-webview`}
          appId={appWindow.appId}
          partition="urbit-webview"
          webpreferences="sandbox=false, nativeWindowOpen=yes"
          allowpopups={true}
          src={appUrl ?? ''}
          isLocked={lockView}
          style={{
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            background: theme.currentTheme.windowColor,
            overflow: 'hidden',
          }}
        />
      </AppViewContainer>
    ),
    [lockView, appWindow.appId, appUrl]
  );
};

export const AppView = observer(AppViewPresenter);
