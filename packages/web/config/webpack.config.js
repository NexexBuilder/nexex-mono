const paths = require('./paths');
const autoprefixer = require('autoprefixer');
const path = require('path'),
  webpack = require('webpack'),
  HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const isDev = (process.env.NODE_ENV === 'dev');

module.exports = {
  entry: {
    app: ['@babel/polyfill', './src/index'],
    vendor: ['react', 'react-dom']
  },
  output: {
    path: paths.appBuild,
    publicPath: paths.servedPath,
    filename: 'js/[name].bundle.js'
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      '@nexex/api': path.resolve(__dirname, '../../api/dist/'),
      '@nexex/types': path.resolve(__dirname, '../../types/dist/'),
      '@nexex/orderbook-client': path.resolve(__dirname, '../../orderbook-client/dist/'),
    }
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      // {
      //     test: /\.tsx?$/,
      //     loader: 'awesome-typescript-loader',
      // },
      {
        // Include ts, tsx, js, and jsx files.
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      // {enforce: "pre", test: /\.js$/, loader: "source-map-loader"},
      {
        test: /\.(css|scss)$/,
        use: [
          'css-hot-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins() {
                return [autoprefixer()];
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'collapsed',
              sourceMap: true,
              includePaths: [paths.appSrc]
            }
          }
        ]
      }
    ]
  },

  plugins: [
    // new MiniCssExtractPlugin({
    //     // Options similar to the same options in webpackOptions.output
    //     // both options are optional
    //     filename: isDev ? '[name].css':'[name].[hash].css',
    //     chunkFilename: isDev ? '[id].css':'[id].[hash].css',
    // })
    new webpack.EnvironmentPlugin({
      SERVED_PATH: paths.servedPath
    })
  ]
};
