/** @type {import('next').NextConfig} */
const withPreconstruct = require('@preconstruct/next');

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: true,
  publicRuntimeConfig: {
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  },
};

module.exports = withPreconstruct(nextConfig);
