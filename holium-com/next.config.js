/** @type {import('next').NextConfig} */
const withPreconstruct = require('@preconstruct/next');

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: true,
};

module.exports = withPreconstruct(nextConfig);
