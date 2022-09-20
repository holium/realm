import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CopyWebpackPlugin from 'copy-webpack-plugin';

import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import checkNodeEnv from '../scripts/check-node-env';

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
checkNodeEnv('production');

const devtoolsConfig =
  process.env.DEBUG_PROD === 'true'
    ? {
        devtool: 'inline-source-map',
      }
    : {};
const configuration: webpack.Configuration = {
  ...devtoolsConfig,
  mode: 'production',
  target: 'electron-renderer',
  entry: [path.join(webpackPaths.srcMainPath, './cursor.preload.js')],
  module: require('./webpack.config.renderer.prod').default.module,
  output: {
    path: webpackPaths.distRendererPath,
    filename: 'cursor.preload.js',
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      'node_modules/react',
      'node_modules/react-dom',
      'node_modules/path-browserify',
    ],
  },
  plugins: [
    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     *
     * By default, use 'development' as NODE_ENV. This can be overriden with
     * 'staging', for example, by changing the ENV variables in the npm scripts
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false,
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: webpackPaths.srcPath,
        output: {
          path: webpackPaths.distRendererPath,
        },
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../../src/main/cursor.preload.js'),
          to: path.resolve(webpackPaths.distRendererPath),
        },
      ],
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

  watch: false,
};

export default merge(baseConfig, configuration);
