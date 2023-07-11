/** @type {import('next').NextConfig} */
const withPreconstruct = require('@preconstruct/next');

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: true,
  publicRuntimeConfig: {
    AMPLITUDE_API_KEY: process.env.AMPLITUDE_API_KEY,
  },
};

module.exports = withPreconstruct(nextConfig);
