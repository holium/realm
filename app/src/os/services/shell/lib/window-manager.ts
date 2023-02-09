import { AppType, RealmConfigType } from 'os/services/spaces/models/bazaar';
import { DEFAULT_APP_WINDOW_DIMENSIONS } from './dimensions';

type Position = { x: number; y: number };
type Dimension = { width: number; height: number };
type Bounds = Position & Dimension;

/**
 * getCenteredXY
 *
 * Calculates the x and y of a centered window based on the height and width.
 *
 * @param Bounds
 * @returns position normalized to the 1-10 scale
 */
export const getCenteredXY = (windowDimensions: Dimension): Position => {
  const appWidth = windowDimensions.width;
  const appHeight = windowDimensions.height;
  const x = Math.floor(5 - appWidth / 2);
  const y = Math.floor(5 - appHeight / 2);

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
    const defaultAppDimensions = {
      width: DEFAULT_APP_WINDOW_DIMENSIONS[app.id].width ?? 3,
      height: DEFAULT_APP_WINDOW_DIMENSIONS[app.id].height ?? 3,
    };
    const defaultXY = getCenteredXY(defaultAppDimensions);
    return {
      x: app.dimensions ? app.dimensions.x : defaultXY.x,
      y: app.dimensions ? app.dimensions.y : defaultXY.y,
      width: app.dimensions ? app.dimensions.width : defaultAppDimensions.width,
      height: app.dimensions
        ? app.dimensions.height
        : defaultAppDimensions.height,
    };
  } else if (app.type === 'web' && app.web.dimensions) {
    const defaultXY = getCenteredXY(app.web.dimensions);

    return {
      x: defaultXY.x,
      y: defaultXY.y,
      width: app.web.dimensions.width,
      height: app.web.dimensions.height,
    };
  } else {
    const fullDims = getFullscreenBounds();

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
 * @param app
 * @returns bounds normalized to the 1-10 scale
 */
export const getInitialWindowBounds = (app: AppType): Bounds => {
  if (app.config) return getConfigBounds(app.config);

  return getCenteredBounds(app);
};

/**
 * getConfigBounds - computes the bounds of a window based on the app's config.
 *
 * @param config - RealmConfigType { size: [number, number], showTitlebar: boolean, titlebarBorder: boolean }
 * @returns bounds normalized to the 1-10 scale
 */
const getConfigBounds = (config: RealmConfigType): Bounds => {
  const xUnit = config.size[0];
  const yUnit = config.size[1];
  const normalizedXOffset = 16 / 10;
  const appWidth = xUnit - normalizedXOffset;
  const normalizedYOffset = (58 + 8) / 10;
  const appHeight = yUnit - normalizedYOffset;
  const appXY = getCenteredXY({
    width: appWidth,
    height: appHeight,
  });

  return {
    x: appXY.x,
    y: appXY.y,
    width: appWidth,
    height: appHeight,
  };
};

// Convert from pixels to the 1-10 scale.
export const normalizeBounds = (
  bounds: Bounds,
  desktopDimensions: Dimension
): Bounds => {
  const xUnitSize = desktopDimensions.width / 10;
  const yUnitSize = desktopDimensions.height / 10;
  const xUnit = Math.round(bounds.x / xUnitSize);
  const yUnit = Math.round(bounds.y / yUnitSize);
  const widthUnit = Math.round(bounds.width / xUnitSize);
  const heightUnit = Math.round(bounds.height / yUnitSize);

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
  desktopDimensions: Dimension
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
