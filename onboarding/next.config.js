/** @type {import('next').NextConfig} */
const withPreconstruct = require('@preconstruct/next');

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: true,
  publicRuntimeConfig: {
    API_URL: process.env.API_URL,
    API_HEADERS_VERSION: process.env.API_HEADERS_VERSION,
    API_HEADERS_CLIENT_ID: process.env.API_HEADERS_CLIENT_ID,
    STRIPE_KEY: process.env.STRIPE_KEY,
    AMPLITUDE_API_KEY: process.env.AMPLITUDE_API_KEY,
  },
};

module.exports = withPreconstruct(nextConfig);
