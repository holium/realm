/** @type {import('next').NextConfig} */
const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants');

module.exports = (phase, { defaultConfig }) => {
  const nextConfig = {
    basePath: phase === PHASE_PRODUCTION_BUILD ? '/passport' : '',
    output: 'export',

    // async headers() {
    //   return [
    //     {
    //       source: '/.well-known/apple-app-site-association',
    //       headers: [
    //         {
    //           key: 'Content-Type',
    //           value: 'application/json',
    //         },
    //       ],
    //     },
    //   ];
    // },

    // async redirects() {
    //   return [
    //     {
    //       source: '/',
    //       destination: process.env.NEXT_PUBLIC_BASE_PATH,
    //       basePath: false,
    //       permanent: false,
    //     },
    //   ];
    // },

    // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
    // trailingSlash: true,

    // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
    // skipTrailingSlashRedirect: true,

    // Optional: Change the output directory `out` -> `dist`
    // distDir: 'dist',

    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },

    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      // !! WARN !!
      ignoreBuildErrors: true,
    },
  };
  return nextConfig;
};
