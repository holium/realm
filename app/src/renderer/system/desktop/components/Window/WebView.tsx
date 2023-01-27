import { DetailedHTMLProps, useEffect, WebViewHTMLAttributes } from 'react';

type WebViewProps = {
  id: string;
  isLocked: boolean;
} & DetailedHTMLProps<
  WebViewHTMLAttributes<HTMLWebViewElement>,
  HTMLWebViewElement
>;

/**
 * Use this component instead of the native webview element.
 * It is used to send its position Electron's main process.
 */
export const WebView = ({ id, isLocked, ...rest }: WebViewProps) => {
  useEffect(() => {
    // Send the webview position to Electron's main process on mount.
    const webView = document.getElementById(id) as Electron.WebviewTag | null;

    if (!webView) return;

    const { x, y } = webView.getBoundingClientRect();

    window.electron.app.updateWebViewPosition(id, { x, y });
  }, [id]);

  return (
    <webview
      id={id}
      {...rest}
      style={{
        ...rest.style,
        pointerEvents: isLocked ? 'none' : 'auto',
      }}
      onPointerEnter={() => window.electron.app.mouseEnteredWebView(id)}
      onPointerLeave={() => window.electron.app.mouseLeftWebView(id)}
    />
  );
};
