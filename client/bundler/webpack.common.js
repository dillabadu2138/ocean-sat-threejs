const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, '../src/script.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
      minify: true,
    }),
    new MiniCSSExtractPlugin(),
    new CopyPlugin({
      patterns: [
        // data
        {
          from: path.resolve(__dirname, '../src/assets/data'),
          to: path.resolve(__dirname, '../dist/assets/data'),
        },
        // images
        {
          from: path.resolve(__dirname, '../src/assets/images'),
          to: path.resolve(__dirname, '../dist/assets/images'),
        },
        // models
        {
          from: path.resolve(__dirname, '../src/assets/models'),
          to: path.resolve(__dirname, '../dist/assets/models'),
        },
        // lut
        {
          from: path.resolve(__dirname, '../src/assets/lut'),
          to: path.resolve(__dirname, '../dist/assets/lut'),
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: [MiniCSSExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader', 'glslify-loader'],
      },
    ],
  },
};
