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

    const { x, y } = webView.getBoundingClientRect();

    window.electron.app.updateWebviewPosition(id, { x, y });

    const handleResize = () =>
      window.electron.app.updateWebviewPosition(id, { x, y });

    webView.addEventListener('resize', handleResize);

    return () => {
      webView.removeEventListener('resize', handleResize);
    };
  }, [id]);

  return (
    <webview
      id={id}
      {...rest}
      onPointerEnter={() => window.electron.app.mouseEnteredWebView(id)}
      onPointerLeave={() => window.electron.app.mouseLeftWebView(id)}
    />
  );
};
