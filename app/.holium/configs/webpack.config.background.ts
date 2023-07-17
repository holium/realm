/**
 * Base webpack config used across other specific configs
 */

import merge from 'webpack-merge';
import baseConfig from './webpack.config.base'
import webpackPaths from './webpack.paths';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';


const configuration = merge(baseConfig, {
  target: 'electron-renderer',
  // target: 'web',
  entry: {
    background: {
      import: path.join(webpackPaths.srcPath, 'os/realm.service.ts')
    }
  },
  output: {
    publicPath: './',
    path: path.join(webpackPaths.distPath, 'background'),
    filename: '[name].js',
    library: {
      type: 'umd',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|.webpack)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    // alias: {
    //   os: require.resolve('os-browserify'),
    // },
    fallback: {
      'process/browser': require.resolve('process/browser'), //fix for trove
      'crypto': require.resolve('crypto-browserify'),
      'stream': require.resolve('stream-browserify'),
      'os': require.resolve('os-browserify/browser'),
    },
  },
  
  // fallback: {
  //   'process/browser': require.resolve('process/browser'), //fix for trove
  
  node: {
    __dirname: false,
    __filename: false,
    global: true,
  },
  externals: {
    electron: 'require("electron")',
    net: 'require("net")',
    fs: 'require("fs")',
    path: 'require("path")',
    'node:os': 'commonjs2 os',
    url: 'require("url")',
    http: 'require("http")',
    https: 'require("https")',
    crypto: 'require("crypto")',
    stream: 'require("stream")',
    dns: 'require("dns")',
    tls: 'require("tls")',
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
		new NodePolyfillPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['background'],
      filename: path.join('background.html'),
      template: path.join(webpackPaths.srcPath, 'background/index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      isBrowser: false,
      env: process.env.NODE_ENV,
      isDevelopment: process.env.NODE_ENV !== 'production',
      nodeModules: webpackPaths.appNodeModulesPath,
    }),
  ]
});

export default configuration;

