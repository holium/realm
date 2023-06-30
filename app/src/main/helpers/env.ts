import { screen } from 'electron';

export const isProduction = process.env.NODE_ENV === 'production';

export const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

export const isMac = process.platform === 'darwin';

const isArm64Mac = process.platform === 'darwin' && process.arch === 'arm64';

// ARM64 Macs from 2021 and later have a camera notch.
// We can proxy it with aspect ratio.
// 16:10 aspect ratio is the threshold for a camera notch.
export const isMacWithCameraNotch = () => {
  const screenResolution = screen.getPrimaryDisplay().size;

  const aspectRatio = screenResolution.width / screenResolution.height;

  return isArm64Mac && aspectRatio < 1.6;
};

export const isWindows = process.platform === 'win32';
