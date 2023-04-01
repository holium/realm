/**
 * Base webpack config used across other specific configs
 */

import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import { dependencies as externals } from '../../release/app/package.json';
import path from 'path';

const configuration: webpack.Configuration = {
  mode: 'production',
  target: 'electron-main',
  entry: {
    os: {
      import: path.join(webpackPaths.srcPath, 'os/start.ts'),
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
          },
        },
      },
    ],
  },
  // externals: [...Object.keys(externals || {})],
  // todo support fs and path
  externals: ['fsevents', 'crypto-browserify'],

  output: {
    path: path.join(webpackPaths.srcPath, 'background'),
    filename: '[name].js',
    // https://github.com/webpack/webpack/issues/1114
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  // resolve: {
  //   extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  //   modules: [webpackPaths.srcPath, 'node_modules'],
  // },
  node: {
    __dirname: false,
    __filename: false,
  },
};

export default configuration;
