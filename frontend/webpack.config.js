// /frontend/webpack.config.js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../backend/public/build'),
    publicPath: '/build/', // served from backend as /public/build
  },

  devtool: 'source-map',
  target: 'web',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{ loader: 'ts-loader' }],
        exclude: /node_modules/,
      },
      // Use asset modules instead of file-loader
      {
        test: /\.(png|jpe?g|svg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash]-[name][ext]',
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      // Ensure source maps from deps get processed
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),

    // Log rebuild completion time
    new webpack.ProgressPlugin((percentage, message) => {
      if (percentage === 1) {
        console.log(`\x1b[32m[Webpack Build Complete]\x1b[0m ${new Date().toLocaleString()}`);
      }
    }),
  ],
};
