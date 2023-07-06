import getConfig from 'next/config';

const nextConfig = getConfig().publicRuntimeConfig;

export const constants = {
  API_URL: nextConfig.API_URL as string,
  API_HEADERS_VERSION: nextConfig.API_HEADERS_VERSION as string,
  API_HEADERS_CLIENT_ID: nextConfig.API_HEADERS_CLIENT_ID as string,
  STRIPE_KEY: nextConfig.STRIPE_KEY as string,
  AMPLITUDE_API_KEY: nextConfig.AMPLITUDE_API_KEY as string,
  CONVERTKIT_API_KEY: nextConfig.CONVERTKIT_API_KEY as string,
};

export const downloadLinks = {
  macM1: 'https://download.holium.com/latest-Realm-mac-arm64.dmg',
  macIntel: 'https://download.holium.com/latest-Realm-mac.dmg',
  windows: 'https://download.holium.com/latest/windows',
  linux: 'https://download.holium.com/latest/linux',
};

export const getSupportEmail = (patp?: string) =>
  `mailto:support@holium.com?subject=Hosting Support${
    patp ? ` for ${patp}` : ''
  }&body=A picture is worth a thousand words. Please attach any screenshots that may help us understand your issue.`;
