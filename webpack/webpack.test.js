const { root } = require('./helpers');
const webpack = require('webpack');
const { resolve } = require('path');


module.exports = function (options) {
  return {
    devtool: 'inline-source-map',
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
        { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader', exclude: [ root('node_modules/rxjs'), root('node_modules/@angular') ] },
        { test: /\.ts$/, use: [ { loader: 'awesome-typescript-loader', options: { configFileName: 'tsconfig.test.json', module: 'commonjs' } }, { loader: 'angular2-template-loader' } ] },
        { test: /\.json$/, loader: 'json-loader', exclude: [root('src/index.html')] },
        { test: /\.css$/, loader: ['to-string-loader', 'css-loader'], exclude: [root('src/index.html')] },
        { test: /\.scss$|\.sass$/, loader: ['raw-loader', 'sass-loader'], exclude: [root('src/index.html')] },
        { test: /\.html$/, loader: 'raw-loader', exclude: [root('src/index.html')] }
      ]
    },
    plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('test')
        }),
        new webpack.ContextReplacementPlugin(
          /angular(\\|\/)core(\\|\/)@angular/,
          resolve(__dirname, '../src')
        )
    ],
    performance: { hints: false },
    stats: 'errors-only',
    node: {
      global: true,
      process: false,
      crypto: 'empty',
      fs: 'empty',
      net: 'empty',
      module: false,
      clearImmediate: false,
      setImmediate: false
    },
    externals: {
      'electron': 'require("electron")',
      'net': 'require("net")',
      'remote': 'require("remote")',
      'shell': 'require("shell")',
      'app': 'require("app")',
      'ipc': 'require("ipc")',
      'fs': 'require("fs")',
      'os': 'require("os")',
      'buffer': 'require("buffer")',
      'system': '{}',
      'file': '{}',
      'node-pty': 'require("node-pty")',
      'font-manager': 'require("font-manager")',
      'child_process': 'require("child_process")'
    }
  };
}
