import { AppType, RealmConfigType } from 'os/services/spaces/models/bazaar';
import { Dimensions, Position, Bounds } from 'os/types';
import { DEFAULT_APP_WINDOW_DIMENSIONS } from './dimensions';

/**
 * getCenteredPosition
 *
 * Calculates the x and y of a centered window based on the height and width.
 *
 * @param Bounds
 * @returns position normalized to the 1-10 scale
 */
export const getCenteredPosition = (windowDimensions: Dimensions): Position => {
  const x = 5 - windowDimensions.width / 2;
  const y = 5 - windowDimensions.height / 2;

  return { x, y };
};

/**
 * getFullscreenBounds
 *
 * Calculates the bounds for a fullscreen window.
 *
 * @returns bounds normalized to the 1-10 scale
 */
const getFullscreenBounds = (): Bounds => {
  const normalizedMargin = 16 / 10;
  const normalizedTrayHeight = 50 / 10;
  const windowHeight = 10 - normalizedMargin - normalizedTrayHeight;
  const windowWidth = 10 - normalizedMargin;

  return {
    x: 0,
    y: normalizedMargin / 2,
    width: windowWidth,
    height: windowHeight,
  };
};

/**
 * getCenteredBounds
 *
 * Calculates the position of a window opened with default dimensions and centered.
 *
 * @param app
 * @returns dimensions normalized to the 1-10 scale
 */
const getCenteredBounds = (app: any): Bounds => {
  if (DEFAULT_APP_WINDOW_DIMENSIONS[app.id]) {
    console.log(DEFAULT_APP_WINDOW_DIMENSIONS);
    const defaultDimensions = {
      width: DEFAULT_APP_WINDOW_DIMENSIONS[app.id].width ?? 6,
      height: DEFAULT_APP_WINDOW_DIMENSIONS[app.id].height ?? 6,
    };
    const defaultPosition = getCenteredPosition(defaultDimensions);

    return {
      x: app.dimensions?.x ?? defaultPosition.x,
      y: app.dimensions?.y ?? defaultPosition.y,
      width: app.dimensions?.width ?? defaultDimensions.width,
      height: app.dimensions?.height ?? defaultDimensions.height,
    };
  } else if (app.type === 'web' && app.web.dimensions) {
    console.log(app.web.dimensions);
    const defaultXY = getCenteredPosition(app.web.dimensions);

    return {
      x: defaultXY.x,
      y: defaultXY.y,
      width: app.web.dimensions.width,
      height: app.web.dimensions.height,
    };
  } else {
    console.log('fullScreenBounds');
    const fullScreenBounds = getFullscreenBounds();

    return {
      x: app.dimensions?.x ?? fullScreenBounds.x,
      y: app.dimensions?.y ?? fullScreenBounds.y,
      width: app.dimensions?.width ?? fullScreenBounds.width,
      height: app.dimensions?.height ?? fullScreenBounds.height,
    };
  }
};

/**
 * getInitialWindowBounds
 *
 * @param app
 * @returns bounds normalized to the 1-10 scale
 */
export const getInitialWindowBounds = (
  app: AppType,
  desktopDimensions: Dimensions | undefined
): Bounds => {
  if (app.config && desktopDimensions) {
    return getConfigBounds(app.config, desktopDimensions);
  }

  return getCenteredBounds(app);
};

/**
 * getConfigBounds - computes the bounds of a window based on the app's config.
 *
 * @param config - RealmConfigType { size: [number, number], showTitlebar: boolean, titlebarBorder: boolean }
 * @returns bounds normalized to the 1-10 scale
 */
const getConfigBounds = (
  config: RealmConfigType,
  desktopDimensions: Dimensions
): Bounds => {
  const configX = config.size[0];
  const configY = config.size[1];

  const padding = (8 / desktopDimensions.width) * 10;
  const dockHeight = (50 / desktopDimensions.height) * 10;
  const offsetX = 2 * padding;
  const offsetY = dockHeight + 3 * padding;

  const appWidth = configX - offsetX;
  const appHeight = configY - offsetY;
  const appXY = getCenteredPosition({
    width: appWidth,
    height: appHeight,
  });

  return {
    x: appXY.x - padding,
    y: appXY.y - dockHeight / 2,
    width: appWidth,
    height: appHeight,
  };
};

// Convert from pixels to the 1-10 scale.
export const normalizeBounds = (
  bounds: Bounds,
  desktopDimensions: Dimensions
): Bounds => {
  const xUnitSize = desktopDimensions.width / 10;
  const yUnitSize = desktopDimensions.height / 10;
  const xUnit = bounds.x / xUnitSize;
  const yUnit = bounds.y / yUnitSize;
  const widthUnit = bounds.width / xUnitSize;
  const heightUnit = bounds.height / yUnitSize;

  return {
    x: xUnit,
    y: yUnit,
    width: widthUnit,
    height: heightUnit,
  };
};

// Convert from the 1-10 scale to pixels.
export const denormalizeBounds = (
  bounds: Bounds,
  desktopDimensions: Dimensions
): Bounds => {
  const xUnitSize = desktopDimensions.width / 10;
  const yUnitSize = desktopDimensions.height / 10;
  const x = bounds.x * xUnitSize;
  const y = bounds.y * yUnitSize;
  const width = bounds.width * xUnitSize;
  const height = bounds.height * yUnitSize;

  return {
    x,
    y,
    width,
    height,
  };
};
