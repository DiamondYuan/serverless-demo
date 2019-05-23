const path = require('path');
const entryLoader = require('./entryLoader');
const TemplateCreatorPlugin = require('./templateCreatorPlugin');
const userConfig = require('../config');

let fs = require('fs');

let nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1 && x !== 'tslib';
  })
  .forEach(function(mod) {
    nodeModules[mod] = `commonjs ${mod}`;
  });

const config = {
  externals: nodeModules,
  entry: entryLoader(userConfig.functionPath),
  mode: 'development',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [new TemplateCreatorPlugin(userConfig)],
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.resolve(process.cwd(), 'build'),
  },
};

module.exports = config;
