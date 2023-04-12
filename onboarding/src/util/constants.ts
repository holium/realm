import getConfig from 'next/config';

const nextConfig = getConfig().publicRuntimeConfig;

export const constants = {
  API_URL: nextConfig.API_URL as string,
  API_HEADERS_VERSION: nextConfig.API_HEADERS_VERSION as string,
  API_HEADERS_CLIENT_ID: nextConfig.API_HEADERS_CLIENT_ID as string,
  STRIPE_KEY: nextConfig.STRIPE_KEY as string,
  AMPLITUDE_API_KEY: nextConfig.AMPLITUDE_API_KEY as string,
};
