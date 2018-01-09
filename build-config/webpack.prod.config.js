'use strict';
var webpack = require("webpack");
var path = require("path");
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
  entry: ['babel-polyfill', './src/app.js'],
  output: {
    path: path.resolve("build/assets"),
    filename: "bundle.js",
    publicPath: path.resolve("build/assets") + '/'
  },
  plugins: [new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new MinifyPlugin()
  ],
  module: {
    loaders: require('./loaders.config')
  }
}