import { DetailedHTMLProps, useEffect, WebViewHTMLAttributes } from 'react';
import { DesktopActions } from 'renderer/logic/actions/desktop';

type WebViewProps = {
  id: string;
  appId: string;
  isLocked: boolean;
  innerRef?: React.Ref<HTMLWebViewElement>;
} & DetailedHTMLProps<
  WebViewHTMLAttributes<HTMLWebViewElement>,
  HTMLWebViewElement
>;

/**
 * Use this component instead of the native webview element.
 */
export const WebView = ({
  id,
  appId,
  isLocked,
  innerRef,
  style,
  ...rest
}: WebViewProps) => {
  useEffect(() => {
    const webView = document.getElementById(id) as Electron.WebviewTag | null;

    if (!webView) return;

    webView.addEventListener('focus', () => {
      DesktopActions.setActive(appId);
    });
  });

  return (
    <webview
      id={id}
      ref={innerRef}
      style={{
        ...style,
        pointerEvents: isLocked ? 'none' : 'auto',
      }}
      {...rest}
    />
  );
};
