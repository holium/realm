/**
 * Base webpack config used across other specific configs
 */

import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import { dependencies as externals } from '../../release/app/package.json';

const configuration: webpack.Configuration = {
  externals: [...Object.keys(externals || {})],

  stats: 'errors-only',

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

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    alias: {
      'react-native$': 'react-native-web',
    },
    // alias: {
    //   react: path.resolve('../../node_modules/react'),
    //   'react-dom': path.resolve('../../node_modules/react-dom'),
    //   'styled-components': path.resolve('../../node_modules/styled-components'),
    //   'styled-system': path.resolve('../../node_modules/styled-system'),
    // },
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      SENTRY_DSN:
        'https://56fbf5e600db48cf8a785931be1ca5e4@o1327359.ingest.sentry.io/4504310987358208',
      AMPLITUDE_API_KEY: 'd6d123a2a660806abcc6b1845c475f2f',
      AMPLITUDE_API_KEY_DEV: '68e00eca14dda372e15a8aadaa0b37ac',
    }),
  ],
};

export default configuration;
