/* eslint-disable prefer-template,object-shorthand,func-names */

const webpack = require('webpack');
const productionConfig = require('./webpack.config');
const autoprefixer = require('autoprefixer');

const HOST = 'localhost';
const PORT = 8000;

module.exports = {
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://' + HOST + ':' + PORT,
    'webpack/hot/only-dev-server',
  ].concat(productionConfig.entry),
  resolve: productionConfig.resolve,
  output: productionConfig.output,
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          forceEnv: 'development',
        },
      }],
    }, {
      test: /\.(scss|css)$/,
      use: [{
        loader: 'style-loader',
      }, {
        loader: 'css-loader',
      }, {
        loader: 'postcss-loader',
        options: {
          plugins: function () {
            return [autoprefixer('last 2 versions', 'ie 9')];
          },
        },
      }, {
        loader: 'sass-loader',
      }],
    }, {
      test: /\.(png)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8192,
        },
      }],
    }],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    contentBase: 'public',
    hot: true,
    host: HOST,
    port: PORT,
  },
};
