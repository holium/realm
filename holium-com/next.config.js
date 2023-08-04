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
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
};

module.exports = withPreconstruct(nextConfig);
