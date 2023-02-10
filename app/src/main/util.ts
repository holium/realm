import { URL } from 'url';
import path from 'path';

export let resolveHtmlPath: (htmlFileName: string) => string;
export let resolveUpdaterPath: (mediaFileName: string) => string;
export let resolveMediaPath: (mediaFileName: string) => string;

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
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
  resolveUpdaterPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, './updater/', htmlFileName)}`;
  };
  resolveMediaPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../../media/', htmlFileName)}`;
  };
}
