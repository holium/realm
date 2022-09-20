import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import CopyWebpackPlugin from 'copy-webpack-plugin';
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
  target: 'electron-preload',
  entry: path.join(
    webpackPaths.srcRendererPath,
    './system/desktop/components/Multiplayer/preload.ts'
  ),

  output: {
    path: webpackPaths.distRendererPath,
    filename: 'cursor.js',
  },
  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.ts'],
    modules: ['node_modules'],
    // alias: {
    //   react: path.resolve('../../node_modules/react'),
    //   'react-dom': path.resolve('../../node_modules/react-dom'),
    // },
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
  // externals: {
  //   react: 'react',
  //   reactDOM: 'react-dom',
  // },

  watch: false,
};

export default merge(baseConfig, configuration);
