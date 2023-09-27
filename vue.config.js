const CompressionWebpackPlugin = require('compression-webpack-plugin');

module.exports = {
  transpileDependencies: true,
  outputDir: 'docs',
  assetsDir: './',
  publicPath: './',

  configureWebpack: {
    plugins: [
      new CompressionWebpackPlugin({
        filename: '[file].gz',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
    ],
  },
};
