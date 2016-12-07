const path = require('path');
//const webpack = require('webpack');

module.exports = {
	entry: [
		'babel-polyfill',
		path.resolve(__dirname, "app", "js", "radical.js")
	],

	output: {
	  	path: path.resolve(__dirname, "dist"),
		filename: "radical.bundle.js"
	},

	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		}]
	},

	plugins: [
		//new webpack.optimize.UglifyJsPlugin({minimize: true})
	]
};
