import { Dimensions } from '@holium/design-system';

import { normalizeDimensions } from './window-manager';

export const DEFAULT_APP_WINDOW_DIMENSIONS: Record<string, Dimensions> = {
  ballot: {
    width: 1200,
    height: 1000,
  },
  campfire: {
    width: 1200,
    height: 1000,
  },
  escape: {
    width: 1200,
    height: 800,
  },
  bitcoin: {
    width: 800,
    height: 800,
  },
  landscape: {
    width: 1200,
    height: 800,
  },
  talk: {
    width: 1200,
    height: 800,
  },
  groups: {
    width: 1200,
    height: 800,
  },
  engram: {
    width: 1200,
    height: 800,
  },
  webterm: {
    width: 780,
    height: 600,
  },
  pals: {
    width: 600,
    height: 700,
  },
  rumors: {
    width: 650,
    height: 700,
  },
  'os-settings': {
    width: 900,
    height: 700,
  },
  'os-browser': {
    width: 1200,
    height: 820,
  },
  sphinx: {
    width: 600,
    height: 700,
  },
  channel: {
    width: 1000,
    height: 820,
  },
  templeochess: {
    width: 700,
    height: 700,
  },
};

export const getDefaultAppDimensions = (
  appId: string,
  desktopDimensions: Dimensions
) => {
  const defaultDimensions = DEFAULT_APP_WINDOW_DIMENSIONS[appId];

  if (!defaultDimensions) return null;

  return normalizeDimensions(defaultDimensions, desktopDimensions);
};
