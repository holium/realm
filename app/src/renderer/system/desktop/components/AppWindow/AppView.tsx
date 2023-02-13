import { useRef, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { WindowModelType } from 'os/services/shell/desktop.model';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { applyStyleOverrides } from './style-overrides';
import { genCSSVariables } from 'renderer/logic/theme';
import { WebView } from './WebView';
import { AppType } from 'os/services/spaces/models/bazaar';

interface AppViewProps {
  appWindow: WindowModelType;
  isResizing: boolean;
  isDragging: boolean;
  hasTitlebar: boolean;
}

const View = styled(motion.div)`
  transform: translateZ(0);
`;

const AppViewPresenter = ({
  isResizing,
  isDragging,
  appWindow,
}: AppViewProps) => {
  const { ship, desktop, theme, spaces, bazaar } = useServices();
  const [ready, setReady] = useState(false);
  const elementRef = useRef(null);
  const webViewRef = useRef<any>(null);

  const [appConfig, setAppConfig] = useState<any>({
    name: null,
    url: null,
  });

  const app = bazaar.getApp(appWindow.appId) as AppType;
  const isActive = desktop.getWindowByAppId(appWindow.appId)?.isActive;

  const [loading, setLoading] = useState(true);

  const onStartLoading = () => {
    setLoading(true);
  };

  const onStopLoading = () => {
    setLoading(false);
  };

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
      setAppConfig({ url: appUrl });
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

  return useMemo(() => {
    return (
      <View
        style={{
          overflow: 'hidden',
          width: 'inherit',
          height: 'inherit',
          position: 'relative',
        }}
        ref={elementRef}
      >
        {/* {loading && (
          <Flex
            position="absolute"
            left="calc(50% - 4px)"
            top="calc(50% - 4px)"
          >
            <Spinner size={1} />
          </Flex>
        )} */}
        <WebView
          innerRef={webViewRef}
          id={`${appWindow.appId}-urbit-webview`}
          appId={appWindow.appId}
          partition="urbit-webview"
          webpreferences="sandbox=false, nativeWindowOpen=yes"
          // @ts-expect-error
          allowpopups="true"
          src={appConfig.url}
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
      </View>
    );
  }, [lockView, appWindow.appId, appConfig.url]);
};

export const AppView = observer(AppViewPresenter);
