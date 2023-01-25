import { FC, useRef, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
// import { Spinner, Flex } from 'renderer/components';
import { WindowModelProps } from 'os/services/shell/desktop.model';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { applyStyleOverrides } from './style-overrides';
import { genCSSVariables } from 'renderer/logic/theme';
import { WebView } from './WebView';

interface AppViewProps {
  window: WindowModelProps;
  isResizing: boolean;
  isDragging: boolean;
  hasTitlebar: boolean;
}

const View = styled(motion.div)`
  transform: translateZ(0);
`;

export const AppView: FC<AppViewProps> = observer((props: AppViewProps) => {
  const { isResizing, isDragging, window } = props;
  const { ship, desktop, theme, spaces } = useServices();
  const [ready, setReady] = useState(false);
  const elementRef = useRef(null);
  const webViewRef = useRef<any>(null);

  const [appConfig, setAppConfig] = useState<any>({
    name: null,
    url: null,
  });

  const isActive = desktop.isActiveWindow(window.id);

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
      `${window.id}-urbit-webview`
    ) as Electron.WebviewTag;

    if (window && ship && webView) {
      webView.addEventListener('did-start-loading', onStartLoading);
      webView.addEventListener('did-stop-loading', onStopLoading);
      if (process.env.NODE_ENV === 'development') {
        webView.addEventListener(
          'console-message',
          (e: Electron.ConsoleMessageEvent) => {
            if (e.level === 3) {
              console.error(`${window.id} => `, e.message);
            }
          }
        );
      }
      const css = `
          ${genCSSVariables(theme.currentTheme)}
          ${applyStyleOverrides(window.id, theme.currentTheme)}
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

      let appUrl = `${ship.url}/apps/${window.id}/?spaceId=${spaces.selected?.path}`;

      if (window.href?.site) {
        appUrl = `${ship.url}${window.href?.site}?spaceId=${spaces.selected?.path}`;
      }

      DesktopActions.openAppWindow('', toJS(window));
      setAppConfig({ url: appUrl });
    }

    () => {
      setReady(false);
    };
  }, [
    ship,
    window,
    spaces.selected?.path,
    desktop.mouseColor,
    theme.currentTheme.backgroundColor,
    theme.currentTheme.mode,
  ]);

  // Set mouse color
  useEffect(() => {
    if (ready) {
      const webView: Electron.WebviewTag = document.getElementById(
        `${window.id}-urbit-webview`
      ) as Electron.WebviewTag;

      webView?.send('mouse-color', desktop.mouseColor);
    }
  }, [desktop.mouseColor, ready]);

  // Set theme on change
  useEffect(() => {
    if (ready) {
      const css = `
        ${genCSSVariables(theme.currentTheme)}
        ${applyStyleOverrides(window.id, theme.currentTheme)}
      `;
      const webView: Electron.WebviewTag = document.getElementById(
        `${window.id}-urbit-webview`
      ) as Electron.WebviewTag;
      webView.insertCSS(css);
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
          ref={webViewRef}
          id={`${window.id}-urbit-webview`}
          partition="urbit-webview"
          webpreferences="sandbox=false, nativeWindowOpen=yes"
          // @ts-expect-error
          allowpopups="true"
          src={appConfig.url}
          style={{
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            background: theme.currentTheme.windowColor,
            overflow: 'hidden',
            pointerEvents: lockView ? 'none' : 'auto',
          }}
        />
      </View>
    );
  }, [lockView, window.id, appConfig.url]);
});
