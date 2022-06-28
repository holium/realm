import { toJS } from 'mobx';
import { AppModelType } from 'core-a/ship/stores/docket';
import { NativeAppType } from 'renderer/apps';
import { DEFAULT_APP_WINDOW_DIMENSIONS } from './dimensions';

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
  desktopDimensions: { width: number; height: number }
): { x: number; y: number } => {
  const appWidth = appDimensions.width;
  const appHeight = appDimensions.height;
  const desktopWidth = desktopDimensions.width;
  const desktopHeight = desktopDimensions.height;

  const x = desktopWidth / 2 - appWidth / 2;
  const y = desktopHeight / 2 - appHeight / 2 - 58;
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
  desktopDimensions: { width: number; height: number },
  isFullscreen?: boolean
): { x: number; y: number; width: number; height: number } => {
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
  desktopDimensions: { width: number; height: number }
): { x: number; y: number; width: number; height: number } => {
  const { width, height } = desktopDimensions;
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
};

/**
 * getInitialWindowDimensions
 *
 * Determines how the window should be opened, centered or fullscreen, and then
 * calculates the window x, y, width, and height
 *
 * @param app
 * @param isFullscreen
 * @returns dimensions: { x: number; y: number; width: number; height: number }
 */
export const getInitialWindowDimensions = (
  app: any,
  desktopDimensions: { width: number; height: number },
  isFullscreen?: boolean
): { x: number; y: number; width: number; height: number } => {
  let dimensions: { x: number; y: number; width: number; height: number };
  switch (app.type) {
    case 'urbit':
      const urbitApp: AppModelType = app;
      dimensions = getCenteredDimensions(urbitApp, desktopDimensions);
      break;
    case 'web':
      const webApp: NativeAppType = app;
      if (webApp.web?.openFullscreen) {
        dimensions = getFullscreenDimensions(desktopDimensions, isFullscreen);
        break;
      }
      dimensions = getCenteredDimensions(webApp, desktopDimensions);
      break;
    case 'native':
      const nativeApp: NativeAppType = app;
      if (nativeApp.native?.openFullscreen) {
        dimensions = getFullscreenDimensions(desktopDimensions, isFullscreen);
        break;
      }
      dimensions = getCenteredDimensions(nativeApp, desktopDimensions);
      break;
  }
  return dimensions!;
};
