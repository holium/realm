/**
 * Build config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import checkNodeEnv from '../scripts/check-node-env';
import deleteSourceMaps from '../scripts/delete-source-maps';
const Dotenv = require('dotenv-webpack');

checkNodeEnv('production');
deleteSourceMaps();

const devtoolsConfig = {
  devtool: 'source-map',
};

const configuration: webpack.Configuration = {
  ...devtoolsConfig,
  mode: 'production',
  target: ['web', 'electron-renderer'],
  entry: {
    app: path.join(webpackPaths.srcRendererPath, 'index.tsx'),
    mouse: path.join(webpackPaths.srcRendererPath, 'mouse.tsx'),
    updater: path.join(
      webpackPaths.srcRendererPath,
      'system/updater/index.tsx'
    ),
  },
  output: {
    path: webpackPaths.distRendererPath,
    publicPath: './',
    filename: '[name].renderer.js',
    library: {
      type: 'umd',
    },
  },
  module: {
    rules: [
      {
        test: /\.s?(a|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
            },
          },
          'sass-loader',
        ],
        include: /\.module\.s?(c|a)ss$/,
      },
      {
        test: /\.s?(a|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        exclude: /\.module\.s?(c|a)ss$/,
      },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      // Images
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin(),
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
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      INSTALL_MOON: '~hostyv',
      DEBUG_PROD: false,
      SENTRY_DSN:
        'https://56fbf5e600db48cf8a785931be1ca5e4@o1327359.ingest.sentry.io/4504310987358208',
      AMPLITUDE_API_KEY: 'd6d123a2a660806abcc6b1845c475f2f',
      AMPLITUDE_API_KEY_DEV: '68e00eca14dda372e15a8aadaa0b37ac',
      BUILD_VERSION: process.env.BUILD_VERSION,
    }),
    // load environment variables from .env file generated in the CI workflow
    new Dotenv({
      path: '.env',
      // safe: false, // load '.env.example' to verify the '.env' variables are all set. Can also be a string to a different file.
      // allowEmptyValues: false, // allow empty variables (e.g. `FOO=`) (treat it as empty string, rather than missing)
      // systemvars: false, // load all the predefined 'process.env' variables which will trump anything local per dotenv specs.
      // silent: false, // hide any errors
      // defaults: false, // load '.env.defaults' as the default values if empty.
    }),
    new MiniCssExtractPlugin({
      filename: '[name].style.css',
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled',
      analyzerPort: 8889,
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new HtmlWebpackPlugin({
      chunks: ['app'],
      filename: 'index.html',
      template: path.join(webpackPaths.srcRendererPath, 'index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      isBrowser: false,
      isDevelopment: process.env.NODE_ENV !== 'production',
    }),
    new HtmlWebpackPlugin({
      chunks: ['mouse'],
      filename: 'mouse.html',
      template: path.join(webpackPaths.srcRendererPath, 'index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      isBrowser: false,
      isDevelopment: process.env.NODE_ENV !== 'production',
    }),
    new HtmlWebpackPlugin({
      chunks: ['updater'],
      filename: 'updater.html',
      template: path.join(webpackPaths.srcRendererPath, 'index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      isBrowser: false,
      isDevelopment: process.env.NODE_ENV !== 'production',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../../media'),
          to: path.resolve(webpackPaths.distRendererPath),
        },
      ],
    }),
  ],
};

export default merge(baseConfig, configuration);
