var path = require('path');
const webpack = require("webpack");

module.exports = {
  mode: process.env.NODE_ENV,
  entry: './src/index.tsx',
  devtool: process.env.NODE_ENV == 'production' ? false : "source-map",
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: { extensions: ['.ts', '.tsx', '.js'] },
  devServer: {
    contentBase: [path.join(__dirname,'./')],
    hot: true,
    inline: true,
    allowedHosts: ['a.com'],
    port: 3000,
    publicPath: '/dist/'
  },
  plugins: [ new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin() ]
};