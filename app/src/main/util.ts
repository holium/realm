import { app } from 'electron';
import path from 'path';
import { URL } from 'url';

export let resolveHtmlPath: (htmlFileName: string) => string;
export let resolveUpdaterPath: (mediaFileName: string) => string;
export let resolveMediaPath: (mediaFileName: string) => string;
export let resolveBackgroundProcessPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
  resolveUpdaterPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, './updater/', htmlFileName)}`;
  };
  resolveBackgroundProcessPath = (htmlFileName: string) => {
    return `file://${path.resolve(
      __dirname,
      '../../release/app/dist/background/',
      htmlFileName
    )}`;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
  resolveUpdaterPath = (htmlFileName: string) => {
    const filename = `file://${path.resolve(
      process.resourcesPath,
      './updater/',
      htmlFileName
    )}`;
    return filename;
  };
  resolveMediaPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../../media/', htmlFileName)}`;
  };
}

export const getAssetPath = (...paths: string[]) =>
  app.isPackaged
    ? path.join(process.resourcesPath, 'assets', ...paths)
    : path.join(__dirname, '../../assets', ...paths);

export const getPreloadPath = () =>
  app.isPackaged
    ? path.join(__dirname, 'preload.js')
    : path.join(__dirname, '../../.holium/dll/preload.js');

export const getOSPreloadPath = () =>
  app.isPackaged
    ? path.join(__dirname, 'osPreload.js')
    : path.join(__dirname, '../../.holium/dll/osPreload.js');
