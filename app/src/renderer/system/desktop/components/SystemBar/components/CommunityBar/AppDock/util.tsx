// First uppercase letter of the website name.
// Remove any protocol and www. from the url.
export const getCharacterFromUrl = (url: string) =>
  url
    .replace(/(^\w+:|^)\/\//, '')
    .replace('www.', '')
    .substring(0, 1)
    .toUpperCase();

export const getFaviconFromUrl = (url: string) => {
  return `https://www.google.com/s2/favicons?domain=${url}&sz=256`;
};

export const getSiteNameFromUrl = (url: string) =>
  url
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
    .split('.')[0]
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\/$/, '');
