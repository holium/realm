import { AppTypes } from 'renderer/stores/models/bazaar.model';

const _getWebViewId = (activeWindowId: string, webViewType: AppTypes) =>
  `${activeWindowId}-${webViewType}-webview`;

export const getWebViewId = (activeWindowId: string, windowType: string) => {
  if (windowType === 'urbit') {
    return _getWebViewId(activeWindowId, AppTypes.Urbit);
  }
  return _getWebViewId(activeWindowId, AppTypes.Web);
};
