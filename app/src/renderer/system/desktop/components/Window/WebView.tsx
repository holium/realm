import { DetailedHTMLProps, WebViewHTMLAttributes } from 'react';

type WebViewProps = {
  id: string;
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
  isLocked,
  innerRef,
  style,
  ...rest
}: WebViewProps) => (
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
