const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 添加别名
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': require.resolve('process/browser.js'),
      };
      
      // 添加Node.js polyfills
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer"),
        "process": require.resolve("process"),
        "assert": require.resolve("assert"),
        "crypto": false,
        "fs": false,
        "path": false,
        "os": false,
        "http": false,
        "https": false,
        "url": false,
        "zlib": false,
        "util": false
      };

      // 添加plugins
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process'
        })
      ];

      return webpackConfig;
    }
  }
};
