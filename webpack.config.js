const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

module.exports = {
	entry: {
		mobile: [
			'babel-polyfill',
			path.resolve(__dirname, 'app', 'js', 'index-mobile.js')
		],
		desktop: [
			'babel-polyfill',
			path.resolve(__dirname, 'app', 'js', 'index-desktop.js')
		]
	},

	output: {
	  	path: path.resolve(__dirname, 'dist', 'js'),
		filename: 'radical-[name].bundle.js'
	},

	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		}]
	},

	plugins: [
		new UglifyJsPlugin({minimize: true}),
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, 'app', 'css'),
				to: path.resolve(__dirname, 'dist', 'css')
			},
			{
				from: path.resolve(__dirname, 'app', 'font'),
				to: path.resolve(__dirname, 'dist', 'font')
			},
			{
				from: path.resolve(__dirname, 'app', 'img'),
				to: path.resolve(__dirname, 'dist', 'img')
			}
		])
	]
};
