const webpack = require('webpack');
const fs = require('fs');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('./paths');
const webpackConfig = require('./webpack.config');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const port = process.env.PORT || 3000;
const host = '0.0.0.0';
module.exports = merge(webpackConfig, {
    mode: 'development',
    entry: {
        app: [
            // bundle the client for webpack-dev-server
            // and connect to the provided endpoint
            `webpack-dev-server/client?http://${host}:${port}`,
            // bundle the client for hot reloading
            // only- means to only hot reload for successful updates
            'webpack/hot/only-dev-server',
            // the entry point of our app
            './src/index.tsx',
        ],
    },
    devtool: 'inline-source-map',
    optimization: {
        minimize: false,
        namedModules: true,
        noEmitOnErrors: true,
    },
    devServer: {
        contentBase: ['./', './public'],
        publicPath: '/',
        historyApiFallback: true,
        port,
        host,
        disableHostCheck: true,
        hot: true,
        compress: true,
        before: function(app) {
            app.get('/config/config.js', function(req, res) {
                res.write(fs.readFileSync('./env_settings/config.js'));
                res.end();
            });
        },
        stats: "minimal"
    },
    plugins: [
        // make hot reloading work
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            hash: true,
            inject: true,
            template: paths.appIndexTplDev,
            filename: 'index.html'
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
        })
    ]

});
