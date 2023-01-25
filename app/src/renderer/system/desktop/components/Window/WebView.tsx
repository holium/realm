import { DetailedHTMLProps, useEffect, WebViewHTMLAttributes } from 'react';

type WebViewProps = {
  id: string;
} & DetailedHTMLProps<
  WebViewHTMLAttributes<HTMLWebViewElement>,
  HTMLWebViewElement
>;

/**
 * Use this component instead of the native webview element.
 * It is used to send mouse events to Electron's main process.
 */
export const WebView = ({ id, ...rest }: WebViewProps) => {
  useEffect(() => {
    const webView = document.getElementById(id) as Electron.WebviewTag | null;

    if (!webView) return;

    window.electron.app.updateWebviewPosition(id, {
      x: webView.getBoundingClientRect().x,
      y: webView.getBoundingClientRect().y,
    });
  }, [id]);

  return (
    <webview
      id={id}
      {...rest}
      onPointerEnter={() => {
        window.electron.app.mouseEnteredWebview(id);
      }}
      onPointerLeave={() => {
        window.electron.app.mouseLeftWebview(id);
      }}
    />
  );
};
