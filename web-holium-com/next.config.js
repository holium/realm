/** @type {import('next').NextConfig} */

const nextConfig = {
  // basePath: '/passport',
  output: 'export',

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

module.exports = nextConfig;
