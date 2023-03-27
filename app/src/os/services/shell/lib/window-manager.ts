import { AppType, RealmConfigType } from 'os/services/spaces/models/bazaar';
import { Dimensions, Position, Bounds } from '@holium/design-system';
import { getDefaultAppDimensions } from './dimensions';

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
 * getMaximizedBounds
 *
 * Calculates the bounds for a fullscreen window.
 *
 * @returns bounds normalized to the 1-10 scale
 */
export const getMaximizedBounds = (desktopDimensions: Dimensions): Bounds => {
  const normalizedPaddingX = (8 / desktopDimensions.width) * 10;
  const normalizedPaddingY = (8 / desktopDimensions.height) * 10;
  const normalizedDockHeight = (40 / desktopDimensions.height) * 10;

  const offsetX = 2 * normalizedPaddingX;
  const offsetY = 3 * normalizedPaddingY + normalizedDockHeight;

  const windowWidth = 10 - offsetX;
  const windowHeight = 10 - offsetY;

  return {
    x: 0,
    y: normalizedPaddingY,
    width: windowWidth,
    height: windowHeight,
  };
};

export const isMaximizedBounds = (
  bounds: Bounds,
  desktopDimensions: Dimensions
) => {
  const maximizedBounds = getMaximizedBounds(desktopDimensions);
  const margin = 0.01;

  return (
    Math.abs(bounds.x - maximizedBounds.x) < margin &&
    Math.abs(bounds.y - maximizedBounds.y) < margin &&
    Math.abs(bounds.width - maximizedBounds.width) < margin &&
    Math.abs(bounds.height - maximizedBounds.height) < margin
  );
};

/**
 * getCenteredBounds
 *
 * Calculates the position of a window opened with default dimensions and centered.
 *
 * @param app
 * @returns dimensions normalized to the 1-10 scale
 */
const getCenteredBounds = (app: any, desktopDimensions: Dimensions): Bounds => {
  const defaultAppDimensions = getDefaultAppDimensions(
    app.id,
    desktopDimensions
  );

  if (defaultAppDimensions) {
    const defaultDimensions = {
      width: defaultAppDimensions.width,
      height: defaultAppDimensions.height,
    };
    const defaultPosition = getCenteredPosition(defaultDimensions);

    return {
      x: app.dimensions?.x ?? defaultPosition.x,
      y: app.dimensions?.y ?? defaultPosition.y,
      width: app.dimensions?.width ?? defaultDimensions.width,
      height: app.dimensions?.height ?? defaultDimensions.height,
    };
  } else if (app.type === 'web' && app.web.dimensions) {
    const defaultXY = getCenteredPosition(app.web.dimensions);

    return {
      x: defaultXY.x,
      y: defaultXY.y,
      width: app.web.dimensions.width,
      height: app.web.dimensions.height,
    };
  } else {
    const fullScreenBounds = getMaximizedBounds(desktopDimensions);

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
  desktopDimensions: Dimensions
): Bounds => {
  if (app.config) {
    return getConfigBounds(app.config, desktopDimensions);
  }

  return getCenteredBounds(app, desktopDimensions);
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

  const normalizedPaddingX = (8 / desktopDimensions.width) * 10;
  const normalizedPaddingY = (8 / desktopDimensions.height) * 10;
  const normalizedDockHeight = (40 / desktopDimensions.height) * 10;

  const offsetX = 2 * normalizedPaddingX;
  const offsetY = 3 * normalizedPaddingY + normalizedDockHeight;

  const appWidth = configX - offsetX;
  const appHeight = configY - offsetY;
  const appPosition = getCenteredPosition({
    width: appWidth,
    height: appHeight,
  });

  return {
    x: appPosition.x - offsetX / 2,
    y: appPosition.y - offsetY / 2 + normalizedPaddingY,
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

// Convert from pixels to the 1-10 scale.
export const normalizeDimensions = (
  dimensions: Dimensions,
  desktopDimensions: Dimensions
): Dimensions => ({
  width: dimensions.width / (desktopDimensions.width / 10),
  height: dimensions.height / (desktopDimensions.height / 10),
});

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

/* Converts position from pixels to the 1-10 scale. */
export const normalizePosition = (
  position: Position,
  desktopDimensions: Dimensions
): Position => ({
  x: position.x / (desktopDimensions.width / 10),
  y: position.y / (desktopDimensions.height / 10),
});

/* Converts position from the 1-10 scale to pixels. */
export const denormalizePosition = (
  position: Position,
  desktopDimensions: Dimensions
): Position => ({
  x: position.x * (desktopDimensions.width / 10),
  y: position.y * (desktopDimensions.height / 10),
});
