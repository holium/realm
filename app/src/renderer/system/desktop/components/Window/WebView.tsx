import { DetailedHTMLProps, WebViewHTMLAttributes } from 'react';

type WebViewProps = {
  id: string;
  isLocked: boolean;
} & DetailedHTMLProps<
  WebViewHTMLAttributes<HTMLWebViewElement>,
  HTMLWebViewElement
>;

/**
 * Use this component instead of the native webview element.
 */
export const WebView = ({ id, isLocked, ...rest }: WebViewProps) => (
  <webview
    id={id}
    {...rest}
    style={{
      ...rest.style,
      pointerEvents: isLocked ? 'none' : 'auto',
    }}
  />
);
