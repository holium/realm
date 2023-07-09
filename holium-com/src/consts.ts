import getConfig from 'next/config';

const nextConfig = getConfig().publicRuntimeConfig;

export const constants = {
  AMPLITUDE_API_KEY: nextConfig.AMPLITUDE_API_KEY as string,
};

export const MOBILE_WIDTH = 560;
export const DESKTOP_WIDTH = 1480;

export const LOGIN_HREF = 'https://hosting.holium.com/login';

export const GET_REALM_HREF = 'http://hosting.holium.com/get-realm';
