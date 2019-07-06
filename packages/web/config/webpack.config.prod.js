const merge = require('webpack-merge');
const webpack = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('./paths');
const webpackConfig = require('./webpack.config');

module.exports = merge(webpackConfig, {
    mode: 'production',
    optimization: {
        // minimize: false,
        minimizer: [
            new UglifyJSPlugin({
                parallel: true,
                sourceMap: true,
                uglifyOptions: {
                    keep_classnames: true,
                    keep_fnames: true,
                    compress: {
                        unused: false,
                        dead_code: false,
                    },
                    mangle: {
                        reserved: ['BigNumber'],
                    },
                },
            }),
        ],
        splitChunks: {
            maxInitialRequests: 5,
            cacheGroups: {
                eth: {
                    test: /(web3.*|ethereum.*|ethjs.*|keythereum|bignumber.js)/,
                    name: 'ethereum',
                    priority: -19,
                    chunks: 'initial',
                },
                react: {
                    test: /(react.*|antd.*|redux.*|jquery|radium)/,
                    name: 'ui',
                    priority: -20,
                    chunks: 'initial',
                },
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'common',
                    priority: -30,
                    chunks: 'initial',
                },
            },
        },
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            hash: true,
            inject: true,
            template: paths.appIndexTplProd,
            filename: paths.appHtml
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css',
        })
    ]

});
