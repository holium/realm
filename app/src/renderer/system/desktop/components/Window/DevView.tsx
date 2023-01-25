import { useEffect, useMemo, useRef, useState } from 'react';
import { useServices } from 'renderer/logic/store';
import { lighten, darken } from 'polished';
import { WebView } from './WebView';

interface Props {
  window: any;
  isResizing?: boolean;
  hasTitlebar: boolean | undefined;
}

export const DevView = (props: Props) => {
  const { window, isResizing } = props;
  const [ready, setReady] = useState(false);

  const { ship, desktop, theme } = useServices();
  const webViewRef = useRef<any>(null);
  const elementRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const onStartLoading = () => {
    setLoading(true);
  };

  const onStopLoading = () => {
    setLoading(false);
  };

  useEffect(() => {
    const webview: any = document.getElementById(`${window.id}-web-webview`);
    webview?.addEventListener('did-start-loading', onStartLoading);
    webview?.addEventListener('did-stop-loading', onStopLoading);
    webview?.addEventListener('did-finish-load', () => {
      webview.send('mouse-color', desktop.mouseColor);
      const css = '* { cursor: none !important; }';
      webview.insertCSS(css);
    });

    webview?.addEventListener('close', () => {
      webview?.closeDevTools();
    });
  }, []);

  // Sync ship model info into app window
  useEffect(() => {
    webViewRef.current?.addEventListener('dom-ready', () => {
      webViewRef.current?.send('load-ship', JSON.stringify(ship));
      webViewRef.current?.send('load-window-id', window.id);
      setReady(true);
    });
  }, [ship, window.id]);

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
   
      #rlm-cursor {
        position: absolute;
        z-index: 2147483646 !important;
      }

      
    `;

    if (ready) {
      const webview = document.getElementById(
        `${window.id}-web-webview`
      ) as Electron.WebviewTag | null;
      webview?.insertCSS(css);
      webview?.addEventListener('did-frame-finish-load', () => {
        webview?.insertCSS(css);
      });
    }
  }, [theme.currentTheme.backgroundColor, theme.currentTheme.mode, ready]);

  return useMemo(
    () => (
      <div
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          width: 'inherit',
          height: 'inherit',
        }}
        ref={elementRef}
      >
        <WebView
          ref={webViewRef}
          id={`${window.id}-web-webview`}
          src={window.href.site}
          partition={'persist:dev-webview'}
          webpreferences="sandbox=false"
          style={{
            background: lighten(0.04, theme.currentTheme.windowColor),
            width: 'inherit',
            height: '100%',
            position: 'relative',
            pointerEvents: isResizing || loading ? 'none' : 'auto',
          }}
        />
      </div>
    ),
    [window.href.site, isResizing, loading, theme.currentTheme.windowColor]
  );
};
