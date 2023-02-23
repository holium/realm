export const isProduction = process.env.NODE_ENV === 'production';

export const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

export const isMac = process.platform === 'darwin';

export const isWindows = process.platform === 'win32';
