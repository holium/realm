const hasProtocol = (query: string) =>
  Boolean(query.match(/(http(s)?):\/\//gi));

export const isUrlSafe = (url: string) => {
  return url.startsWith('https://');
};

const hasDot = (query: string) => Boolean(query.match(/\./gi));

const hasPort = (query: string) => Boolean(query.match(/:\d+/gi));

const isValidUrl = (query: string) =>
  hasProtocol(query) && (hasDot(query) || hasPort(query));

const isLocaHostOrIpAddress = (query: string) =>
  Boolean(query.match(/^(localhost)/gi)) ||
  Boolean(query.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::\d+)?$/gi));

export const homePage = 'https://neeva.com';

const searchBase = `${homePage}/search?q=`;

export const createUrl = (query: string) => {
  let potentialUrl = query;
  if (!hasProtocol(query)) {
    if (isLocaHostOrIpAddress(query)) {
      potentialUrl = `http://${query}`;
    } else {
      potentialUrl = `https://${query}`;
    }
  }
  if (isValidUrl(potentialUrl)) {
    return potentialUrl;
  }

  return `${searchBase}${encodeURIComponent(query)}`;
};
