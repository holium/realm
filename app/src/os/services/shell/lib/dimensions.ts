import { Dimensions } from '@holium/design-system';
import { normalizeDimensions } from './window-manager';

const DEFAULT_APP_WINDOW_DIMENSIONS: Record<string, Dimensions> = {
  ballot: {
    width: 1200,
    height: 1000,
  },
  campfire: {
    width: 1200,
    height: 900,
  },
  escape: {
    width: 1200,
    height: 900,
  },
  bitcoin: {
    width: 800,
    height: 900,
  },
  landscape: {
    width: 1200,
    height: 900,
  },
  talk: {
    width: 1200,
    height: 900,
  },
  groups: {
    width: 1200,
    height: 900,
  },
  engram: {
    width: 1200,
    height: 900,
  },
  webterm: {
    width: 780,
    height: 600,
  },
  'os-settings': {
    width: 800,
    height: 650,
  },
  sphinx: {
    width: 600,
    height: 700,
  },
  channel: {
    width: 1000,
    height: 900,
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
