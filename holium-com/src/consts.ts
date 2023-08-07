import getConfig from 'next/config';

const nextConfig = getConfig().publicRuntimeConfig;

export const constants = {
  API_URL: nextConfig.API_URL as string,
  API_HEADERS_VERSION: nextConfig.API_HEADERS_VERSION as string,
  API_HEADERS_CLIENT_ID: nextConfig.API_HEADERS_CLIENT_ID as string,
  AMPLITUDE_API_KEY: nextConfig.AMPLITUDE_API_KEY as string,
};

export const MOBILE_WIDTH = 560;
export const DESKTOP_WIDTH = 1480;

const isDev = process.env.NODE_ENV === 'development';
const hostingBaseUrl = isDev
  ? 'http://localhost:3000'
  : 'https://hosting.holium.com';

export const hostingHrefs = {
  LOGIN: hostingBaseUrl + '/login',
  GET_REALM: hostingBaseUrl + '/get-realm',
  CREATE_ACCOUNT_WITH_WALLET: hostingBaseUrl + '/create-account-with-wallet',
};
