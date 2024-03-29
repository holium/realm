/**
 * Webpack config for production electron main process
 */

import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import checkNodeEnv from '../scripts/check-node-env';
import deleteSourceMaps from '../scripts/delete-source-maps';

checkNodeEnv('production');
deleteSourceMaps();

const devtoolsConfig = {
  devtool: 'source-map',
};

// the goal here is to load any environment variables from .env (if it exists). Note
//  that dotenv will not overwrite vars that already exist. if you need to do that,
//  try this: require('dotenv').config({ override: true })
// .env for Windows only for now
require('dotenv').config();

const configuration: webpack.Configuration = {
  ...devtoolsConfig,
  mode: 'production',
  target: 'electron-main',
  entry: {
    main: path.join(webpackPaths.srcMainPath, 'main.ts'),
    preload: path.join(webpackPaths.srcMainPath, 'preload.ts'),
    updater: path.join(webpackPaths.srcMainPath, 'updater.ts'),
  },
  output: {
    path: webpackPaths.distMainPath,
    filename: '[name].js',
  },
  // optimization: {
  //   minimizer: [
  //     new TerserPlugin({
  //       parallel: true,
  //     }),
  //   ],
  // },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled',
    }),
    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
      AUTOUPDATE_FEED_URL:
        process.env.RELEASE_CHANNEL === 'latest' ||
        process.env.RELEASE_CHANNEL === 'hotfix'
          ? 'https://download.holium.com'
          : 'https://ghproxy-staging.holium.xyz',
      INSTALL_MOON:
        process.env.RELEASE_CHANNEL === 'latest' ||
        process.env.RELEASE_CHANNEL === 'hotfix'
          ? '~hostyv:realm'
          : '~nimwyd-ramwyl-dozzod-hostyv:realm',
      RELEASE_CHANNEL: process.env.RELEASE_CHANNEL || 'latest',
      ...(process.env.BUILD_VERSION
        ? {
            BUILD_VERSION: process.env.BUILD_VERSION,
          }
        : {}),
    }),
  ],
  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
};

export default merge(baseConfig, configuration);
