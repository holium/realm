import {
  AppType,
  UrbitAppType,
  NativeAppType,
  DevAppType,
  RealmConfigType,
} from 'os/services/spaces/models/bazaar';
import { DEFAULT_APP_WINDOW_DIMENSIONS } from './dimensions';
type DesktopDimensions = { width: number; height: number };
type AppDimensions = { x: number; y: number; width: number; height: number };

/**
 * getCenteredXY
 *
 * Calculates the x and y of a centered window based on the height and width
 *
 * @param appDimensions
 * @param desktopDimensions
 * @returns { x: number; y: number }
 */
export const getCenteredXY = (
  appDimensions: {
    width: number;
    height: number;
  },
  desktopDimensions: DesktopDimensions,
  offset: number = 58
): { x: number; y: number } => {
  const appWidth = appDimensions.width;
  const appHeight = appDimensions.height;
  const desktopWidth = desktopDimensions.width;
  const desktopHeight = desktopDimensions.height;

  const x = Math.floor(desktopWidth / 2 - appWidth / 2);
  const y = Math.floor(desktopHeight / 2 - appHeight / 2) - offset;
  return { x, y };
};

/**
 * getFullscreenDimensions
 *
 * Uses the window height and width to calculate a fullscreen window position.
 *
 * @param isFullscreen
 * @returns { x: number; y: number; width: number; height: number }
 */
export const getFullscreenDimensions = (
  desktopDimensions: DesktopDimensions,
  isFullscreen?: boolean
): AppDimensions => {
  const offset = isFullscreen ? 0 : 30;
  const { width, height } = desktopDimensions;
  const windowHeight = height - (16 + offset) - 50;
  const windowWidth = width - 16;
  return {
    x: 0,
    y: 8,
    width: windowWidth,
    height: windowHeight,
  };
};

/**
 * getCenteredDimensions
 *
 * Calculates the position of a window opened with default dimensions and centered
 *
 * @param app
 * @returns { x: number; y: number; width: number; height: number }
 */
export const getCenteredDimensions = (
  app: any,
  desktopDimensions: DesktopDimensions
): AppDimensions => {
  const { width, height } = desktopDimensions;
  if (DEFAULT_APP_WINDOW_DIMENSIONS[app.id]) {
    const defaultAppDimensions = {
      width: DEFAULT_APP_WINDOW_DIMENSIONS[app.id]
        ? DEFAULT_APP_WINDOW_DIMENSIONS[app.id].width
        : 600,
      height: DEFAULT_APP_WINDOW_DIMENSIONS[app.id]
        ? DEFAULT_APP_WINDOW_DIMENSIONS[app.id].height
        : 600,
    };
    const defaultXY = getCenteredXY(defaultAppDimensions, { width, height });
    return {
      x: app.dimensions ? app.dimensions.x : defaultXY.x,
      y: app.dimensions ? app.dimensions.y : defaultXY.y,
      width: app.dimensions ? app.dimensions.width : defaultAppDimensions.width,
      height: app.dimensions
        ? app.dimensions.height
        : defaultAppDimensions.height,
    };
  } else if (app.type === 'web' && app.web.dimensions) {
    const defaultXY = getCenteredXY(app.web.dimensions, desktopDimensions);
    return {
      x: defaultXY.x,
      y: defaultXY.y,
      width: app.web.dimensions.width,
      height: app.web.dimensions.height,
    };
  } else {
    const fullDims = getFullscreenDimensions(desktopDimensions, true);
    return {
      x: app.dimensions ? app.dimensions.x : fullDims.x,
      y: app.dimensions ? app.dimensions.y : fullDims.y,
      width: app.dimensions ? app.dimensions.width : fullDims.width,
      height: app.dimensions ? app.dimensions.height : fullDims.height,
    };
  }
};

/**
 * getInitialWindowBounds
 *
 * Determines how the window should be opened, centered or fullscreen, and then
 * calculates the window x, y, width, and height
 *
 * @param app
 * @param isFullscreen
 * @returns dimensions: { x: number; y: number; width: number; height: number }
 */
export const getInitialWindowBounds = (
  app: AppType,
  desktopDimensions: DesktopDimensions
): AppDimensions => {
  let dimensions: { x: number; y: number; width: number; height: number };
  let realmConfig: RealmConfigType | null;
  switch (app.type) {
    case 'urbit':
      realmConfig = (app as UrbitAppType).config;
      if (realmConfig) {
        dimensions = normalizeConfigSize(desktopDimensions, realmConfig);
        break;
      }
      dimensions = getCenteredDimensions(
        app as UrbitAppType,
        desktopDimensions
      );
      break;
    case 'dev':
      realmConfig = (app as DevAppType).config;
      if (realmConfig) {
        dimensions = normalizeConfigSize(desktopDimensions, realmConfig);
        break;
      }
      dimensions = getCenteredDimensions(app as DevAppType, desktopDimensions);
      break;
    case 'native':
      realmConfig = (app as NativeAppType).config;
      if (realmConfig) {
        dimensions = normalizeConfigSize(desktopDimensions, realmConfig);
        break;
      }
      dimensions = getCenteredDimensions(
        app as NativeAppType,
        desktopDimensions
      );
      break;
    // case 'dialog':
    //   const dialog: any = app;
    //   if (dialog.native?.openFullscreen) {
    //     dimensions = getFullscreenDimensions(desktopDimensions, isFullscreen);
    //     break;
    //   }
    //   dimensions = getCenteredDimensions(dialog, desktopDimensions);
    //   break;
  }
  return dimensions!;
};

/**
 * normalizeConfigSize - computes the dimensions of a window based on the realm.config 1-10 scale
 *
 * @param desktopDimensions - { width: number; height: number }
 * @param config - RealmConfigType { size: [number, number], showTitlebar: boolean, titlebarBorder: boolean }
 * @returns dimensions: { x: number; y: number; width: number; height: number }
 */
export const normalizeConfigSize = (
  desktopDimensions: DesktopDimensions,
  config: RealmConfigType
): AppDimensions => {
  const xUnit = config.size[0];
  const yUnit = config.size[1];
  const xUnitSize = desktopDimensions.width / 10;
  const yUnitSize = desktopDimensions.height / 10;
  const appWidth = xUnit * xUnitSize;
  const appHeight = yUnit * yUnitSize - 58 - 8;
  const appXY = getCenteredXY(
    {
      width: appWidth,
      height: appHeight,
    },
    desktopDimensions,
    24
  );
  return {
    x: appXY.x,
    y: appXY.y,
    width: appWidth - 16,
    height: appHeight,
  };
};
