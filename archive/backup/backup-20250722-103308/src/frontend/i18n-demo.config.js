const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/I18nDemoApp.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'i18n-demo.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ],
  devServer: {
    historyApiFallback: true,
    hot: true,
    port: 3001
  }
};
