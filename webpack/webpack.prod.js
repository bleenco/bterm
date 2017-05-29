const { root } = require('./helpers');
const webpack = require('webpack');
const extract = require('extract-text-webpack-plugin');
const html = require('html-webpack-plugin');
const { AotPlugin } = require('@ngtools/webpack');

module.exports = {
  context: root('.'),
  entry: root('src/main.aot.ts'),
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    path: root('dist'),
    filename: 'app.bundle.js'
  },
  target: 'electron-renderer',
  module: {
    rules: [
      { test: /\.ts$/, loader: '@ngtools/webpack' },
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.(jp?g|png|gif)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'images/[hash].[ext]' } },
      { test: /\.(eot|woff2?|svg|ttf|otf)([\?]?.*)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'fonts/[hash].[ext]' } },
      { test: /\.css$/, use: extract.extract({ fallback: 'style-loader', use: 'css-loader' }), include: [root('src/styles')] },
      { test: /\.css$/, use: ['to-string-loader', 'css-loader'], exclude: [root('src/styles')] },
      { test: /\.scss$|\.sass$/, loader: extract.extract({ fallback: 'style-loader', use: ['css-loader', 'sass-loader'] }), exclude: [root('src/app')] },
      { test: /\.scss$|\.sass$/, use: ['to-string-loader', 'css-loader', 'sass-loader'], exclude: [root('src/styles')] },
    ]
  },
  plugins: [
    new extract('[name].css'),
    new AotPlugin({ tsConfigPath: './tsconfig.json' }),
    new html({ template: root('./src/index_prod.html'), output: root('dist') }),
    new webpack.optimize.UglifyJsPlugin({ mangle: { except: ['$super', '$', 'exports', 'require'] } })
  ],
  node: {
    __dirname: false,
    __filename: false
  },
  externals: {
    'electron': 'require("electron")',
    'net': 'require("net")',
    'remote': 'require("remote")',
    'shell': 'require("shell")',
    'app': 'require("app")',
    'ipc': 'require("ipc")',
    'fs': 'require("fs")',
    'buffer': 'require("buffer")',
    'system': '{}',
    'file': '{}',
    'node-pty': 'require("node-pty")',
    "font-manager": 'require("font-manager")'
  }
};
