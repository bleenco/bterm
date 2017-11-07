const { resolve } = require('path');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const html = require('html-webpack-plugin');
const copy = require('copy-webpack-plugin');
const extract = require('extract-text-webpack-plugin');
const circular = require('circular-dependency-plugin');
const nodeModules = resolve(__dirname, 'node_modules');
const entryPoints = ['inline', 'polyfills', 'styles', 'vendor', 'app'];

module.exports = function (options, webpackOptions) {
  options = options || {};

  let config = {};

  config = webpackMerge({}, config, {
    entry: getEntry(options),
    resolve: {
      extensions: ['.ts', '.js', '.json'],
      modules: ['node_modules', nodeModules]
    },
    resolveLoader: {
      modules: [nodeModules, 'node_modules']
    },
    output: {
      path: root('build')
    },
    module: {
      rules: [
        { test: /\.html$/, loader: 'raw-loader' },
        { test: /\.json$/, loader: 'json-loader' },
        { test: /\.(jp?g|png|gif)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'images/[hash].[ext]' } },
        { test: /\.(eot|woff2?|svg|ttf|otf)([\?]?.*)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'fonts/[hash].[ext]' } }
      ]
    },
    plugins: [
      new copy([{ context: root('src/assets/public'), from: '**/*' }])
    ],
    externals: {
      'electron': 'require("electron")',
      'net': 'require("net")',
      'os': 'require("os")',
      'remote': 'require("remote")',
      'shell': 'require("shell")',
      'app': 'require("app")',
      'ipc': 'require("ipc")',
      'fs': 'require("fs")',
      'buffer': 'require("buffer")',
      'system': '{}',
      'file': '{}',
      'node-pty': 'require("node-pty")',
      'font-manager': 'require("font-manager")',
      'child_process': 'require("child_process")',
      'shelljs': 'require("shelljs")',
      'xterm': 'require("xterm")'
    }
  });

  config = webpackMerge({}, config, {
    output: {
      path: root('build'),
      filename: '[name].bundle.js',
      chunkFilename: '[id].chunk.js'
    },
    plugins: [
      new html({
        template: root('src/index.html'),
        output: root('build'),
        chunksSortMode: sort = (left, right) => {
          let leftIndex = entryPoints.indexOf(left.names[0]);
          let rightindex = entryPoints.indexOf(right.names[0]);
          if (leftIndex > rightindex) {
            return 1;
          } else if (leftIndex < rightindex) {
            return -1;
          } else {
            return 0;
          }
        }
      })
    ],
    devServer: {
      historyApiFallback: true,
      port: 8000,
      open: true,
      hot: false,
      inline: true,
      stats: { colors: true, chunks: false },
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      }
    }
  });

  if (webpackOptions.p) {
    config = webpackMerge({}, config, getStylesConfig());
  } else {
    config = webpackMerge({}, config, getDevelopmentConfig());
    config = webpackMerge({}, config, getStylesConfig());
  }

  config = webpackMerge({}, config, {
    module: {
      rules: [{ test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/, loader: '@ngtools/webpack' }]
    },
    plugins: [
      new AngularCompilerPlugin({
        tsConfigPath: root('src/tsconfig.app.json'),
        entryModule: 'src/app/app.module#AppModule'
      })
    ]
  });

  return config;
}

function root(path) {
  return resolve(__dirname, path);
}

function getEntry(options) {
  if (options.aot) {
    return { app: root('src/main.ts') };
  } else {
    return { app: root('src/main.ts'), polyfills: root('src/polyfills.ts') };
  }
}

function getDevelopmentConfig() {
  return {
    module: {
      rules: [
        { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader', exclude: [ root('node_modules') ] }
      ]
    },
    plugins: [
      new webpack.SourceMapDevToolPlugin({
        filename: '[file].map[query]',
        moduleFilenameTemplate: '[resource-path]',
        fallbackModuleFilenameTemplate: '[resource-path]?[hash]',
        sourceRoot: 'webpack:///'
      }),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        minChunks: Infinity,
        name: 'inline'
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        chunks: ['app'],
        minChunks: module => {
          return module.resource && module.resource.startsWith(nodeModules)
        }
      })
    ]
  };
}

function getStylesConfig() {
  return {
    plugins: [
      new extract('[name].css')
    ],
    module: {
      rules: [
        { test: /\.css$/, use: extract.extract({ fallback: 'style-loader', use: 'css-loader' }), include: [root('src/styles')] },
        { test: /\.css$/, use: ['to-string-loader', 'css-loader'], exclude: [root('src/styles')] },
        { test: /\.scss$|\.sass$/, loader: extract.extract({ fallback: 'style-loader', use: ['css-loader', 'sass-loader'] }), exclude: [root('src/app')] },
        { test: /\.scss$|\.sass$/, use: ['to-string-loader', 'css-loader', 'sass-loader'], exclude: [root('src/styles')] },
      ]
    }
  };
}
