export enum WebViewType {
  'urbit' = 'urbit',
  'web' = 'web',
}

const _getWebViewId = (activeWindowId: string, webViewType: WebViewType) =>
  `${activeWindowId}-${webViewType}-webview`;

// Assumes webview type 'web'.
export const getWebViewId = (activeWindowId: string, windowType: string) => {
  const webviewId =
    windowType !== 'urbit'
      ? _getWebViewId(activeWindowId, WebViewType.web)
      : _getWebViewId(activeWindowId, WebViewType.urbit);
  return webviewId;
};

export const getWebViewIdEffectful = (
  activeWindowId: string,
  windowType: string
) => {
  let webviewId = getWebViewId(activeWindowId, WebViewType.web);
  if (windowType === 'urbit') {
    webviewId = getWebViewId(activeWindowId, WebViewType.urbit);
  }
  return webviewId;
};
