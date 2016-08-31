/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import path from 'path';
import webpack from 'webpack';
import extend from 'extend';
import AssetsPlugin from 'assets-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import Visualizer from 'webpack-visualizer-plugin';

const DEBUG = !(process.argv.includes('--release') || process.argv.includes('--yorklab'));
const YLB = process.argv.includes('--yorklab');
const VERBOSE = process.argv.includes('--verbose');
const AUTOPREFIXER_BROWSERS = [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 35',
  'Firefox >= 31',
  'Explorer >= 9',
  'iOS >= 7',
  'Opera >= 12',
  'Safari >= 7.1'
];
const PROD_ENV = YLB ? '"yorklab"' : '"production"';
const GLOBALS = {
  'process.env.NODE_ENV': DEBUG ? '"development"' : PROD_ENV,
  __DEV__: DEBUG
};

//
// Common configuration chunk to be used for both
// client-side (client.js) and server-side (server.js) bundles
// -----------------------------------------------------------------------------

const config = {
  context: path.resolve(__dirname, '../src'),
  output: {
    path: path.resolve(__dirname, '../build/public/mobile/assets'),
    publicPath: '/mobile/assets/',
    sourcePrefix: '  '
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, '../src'),
        ],
        query: {
          // https://github.com/babel/babel-loader#options
          cacheDirectory: DEBUG,

          // https://babeljs.io/docs/usage/options/
          babelrc: false,
          presets: [
            'react',
            'es2015',
            'stage-0'
          ],
          plugins: [
            'transform-runtime',
            'transform-decorators-legacy',
            'jsx-control-statements',
            'transform-react-constant-elements',
            'transform-react-inline-elements',
            'transform-react-remove-prop-types'
          ]
        }
      },
      {
        test: /theme.scss$/,
        loaders: DEBUG ? [
          'isomorphic-style-loader',
          'css-loader?sourceMap&modules&localIdentName=[local]&importLoaders=2',
          'postcss?parser=postcss-scss',
          'sass'
        ] : [],
        loader: DEBUG ? null : ExtractTextPlugin.extract([
          'css?minimize&modules&localIdentName=[local]&importLoaders=2',
          'postcss?parser=postcss-scss',
          'sass'
        ])
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.txt$/,
        loader: 'raw-loader'
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        loader: 'url-loader?limit=10000',
        query: {
          name: DEBUG ? '[path][name].[ext]?[hash]' : '[hash].[ext]',
          limit: 10000
        }
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.(eot|ttf|svg)$/,
        loader: 'file-loader',
        query: {
          name: DEBUG ? '[path][name].[ext]?[hash]' : '[hash].[ext]'
        }
      },
      { test: /\.jsx?$/, loader: 'imports?jQuery=jquery' }
    ]
  },
  cache: DEBUG,
  debug: DEBUG,
  stats: {
    colors: true,
    reasons: DEBUG,
    hash: VERBOSE,
    version: VERBOSE,
    timings: true,
    chunks: VERBOSE,
    chunkModules: VERBOSE,
    cached: VERBOSE,
    cachedAssets: VERBOSE
  },

  postcss() {
    return [
      require('postcss-import')({
        onImport: files => files.forEach(this.addDependency),
      }),
      require('postcss-url')({
        copy: 'rebase'
      }),
      require('precss')(),
      require('autoprefixer')({ browsers: AUTOPREFIXER_BROWSERS })
    ];
  }
};

//
// Configuration for the client-side bundle (client.js)
// -----------------------------------------------------------------------------

const clientConfig = extend(true, {}, config, {
  entry: './client.js',
  output: {
    path: path.join(__dirname, '../build/public/mobile/assets/'),
    filename: DEBUG ? '[name].js?[hash]' : '[name].[hash].js'
  },
  resolve: {
    root: path.resolve(__dirname, '../src'),
    modulesDirectories: ['node_modules', path.resolve('./src')],
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.json']
  },
  target: 'web',
  plugins: [
    new webpack.DefinePlugin({
      ...GLOBALS,
      'process.env.BROWSER': true
    }),
    new AssetsPlugin({
      path: path.resolve(__dirname, '../build'),
      filename: 'assets.js',
      processOutput: x => `module.exports = ${JSON.stringify(x)};`
    }),
    new Visualizer(),

    // Assign the module and chunk ids by occurrence count
    // Consistent ordering of modules required if using any hashing ([hash] or [chunkhash])
    // https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
    new webpack.optimize.OccurenceOrderPlugin(true),

    ...(DEBUG ? [] : [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true, // jscs:ignore requireCamelCaseOrUpperCaseIdentifiers
          warnings: VERBOSE
        }
      }),
      new ExtractTextPlugin('[name]-[chunkhash].css', {
        allChunks: true
      }),
      new webpack.optimize.AggressiveMergingPlugin()
    ])
  ],

  // Choose a developer tool to enhance debugging
  // http://webpack.github.io/docs/configuration.html#devtool
  devtool: DEBUG ? 'cheap-module-eval-source-map' : false
});

//
// Configuration for the server-side bundle (server.js)
// -----------------------------------------------------------------------------
const serverConfig = extend(true, {}, config, {
  entry: './server.js',
  output: {
    filename: '../../../server.js',
    libraryTarget: 'commonjs2'
  },
  target: 'node',
  externals: [
    /^\.\/assets$/,
    function filter(context, request, cb) {
      const isExternal =
        request.match(/^[@a-z][a-z\/\.\-0-9]*$/i);
      cb(null, Boolean(isExternal));
    }
  ],
  plugins: [
    new webpack.DefinePlugin({ ...GLOBALS, 'process.env.BROWSER': false }),
    new webpack.BannerPlugin('require("source-map-support").install();',
      { raw: true, entryOnly: false }),
    ...(DEBUG ? [] : [
      new ExtractTextPlugin('[name]-[chunkhash].css', {
        allChunks: true
      })
    ]),
    new webpack.ProgressPlugin((percentage, message) => {
      const MOVE_LEFT = new Buffer('1b5b3130303044', 'hex').toString();
      const CLEAR_LINE = new Buffer('1b5b304b', 'hex').toString();
      process.stdout.write(`${CLEAR_LINE}${Math.round(percentage * 100)}%: ${message}${MOVE_LEFT}`);
    })
  ],
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  },
  devtool: 'source-map'
});

export default [clientConfig, serverConfig];
