import { FC, useRef, useCallback, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
// import { Spinner, Flex } from 'renderer/components';
import { WindowModelProps } from 'os/services/shell/desktop.model';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { darken, lighten } from 'polished';

interface AppViewProps {
  window: WindowModelProps;
  isResizing: boolean;
  isDragging: boolean;
  hasTitlebar: boolean;
}

const View = styled.div<{ hasTitleBar?: boolean }>`
  transform: translateZ(0);
`;

export const AppView: FC<AppViewProps> = observer((props: AppViewProps) => {
  const { isResizing, isDragging, window } = props;
  const { ship, shell, desktop, theme, spaces } = useServices();
  const [ready, setReady] = useState(false);
  const elementRef = useRef(null);
  const webViewRef = useRef<any>(null);

  const [appConfig, setAppConfig] = useState<any>({
    name: null,
    url: null,
  });

  const isActive = desktop.isActiveWindow(window.id);

  const [loading, setLoading] = useState(false);

  // const onStartLoading = () => {
  //   setLoading(true);
  // };

  // const onStopLoading = () => {
  //   setLoading(false);
  // };

  const lockView = useMemo(
    () => isResizing || isDragging || loading || !isActive,
    [isResizing, isDragging, loading, isActive]
  );

  useEffect(() => {
    const webview: any = document.getElementById(`${window.id}-urbit-webview`);
    // webview?.addEventListener('did-start-loading', onStartLoading);
    // webview?.addEventListener('did-stop-loading', onStopLoading);

    if (window && ship) {
      webview?.addEventListener('dom-ready', () => {
        webview.send('mouse-color', desktop.mouseColor);
        const css = '* { cursor: none !important; }';
        webview.insertCSS(css);
        setReady(true);
      });

      webview?.addEventListener('close', () => {
        webview.closeDevTools();
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
  }, [ship, window, spaces.selected?.path, desktop.mouseColor]);

  useEffect(() => {
    const css = `
      :root {
        --rlm-font: 'Rubik', sans-serif;
        --rlm-base-color: ${theme.currentTheme.backgroundColor};
        --rlm-accent-color: ${theme.currentTheme.accentColor};
        --rlm-input-color: ${theme.currentTheme.inputColor};
        --rlm-border-color: ${
          theme.currentTheme.mode === 'light'
            ? darken(0.1, theme.currentTheme.windowColor)
            : darken(0.075, theme.currentTheme.windowColor)
        };
        --rlm-window-color: ${theme.currentTheme.windowColor};
        --rlm-card-color: ${
          theme.currentTheme.mode === 'light'
            ? lighten(0.05, theme.currentTheme.windowColor)
            : darken(0.025, theme.currentTheme.windowColor)
        };
        --rlm-theme-mode: ${theme.currentTheme.mode};
        --rlm-text-color: ${theme.currentTheme.textColor};
        --rlm-icon-color: ${theme.currentTheme.iconColor};
      }
      div[data-radix-portal] {
        z-index: 2000 !important;
      }

      body {
        overflow-x: hidden;
        overflow-y: hidden;
      }

      #rlm-cursor {
        position: absolute;
        z-index: 2147483646 !important;
      }


    `;

    if (ready) {
      const webview: any = document.getElementById(
        `${window.id}-urbit-webview`
      );
      webview.insertCSS(css);
      // TODO request permission for campfire
      webview.webContents?.session?.setPermissionRequestHandler();
      webview?.addEventListener('did-frame-finish-load', () => {
        webview.insertCSS(css);
      });
    }
  }, [theme.currentTheme.backgroundColor, theme.currentTheme.mode, ready]);

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
        <webview
          ref={webViewRef}
          id={`${window.id}-urbit-webview`}
          partition="urbit-webview"
          preload={`file://${desktop.appviewPreload}`}
          webpreferences="sandbox=false"
          src={appConfig.url}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
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
