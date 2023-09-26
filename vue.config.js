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

    performance: {
      hints: 'warning',
      maxAssetSize: 700_000, // バイト単位での個々のアセットの最大サイズ
      maxEntrypointSize: 1_000_000, // バイト単位でのエントリポイントの最大サイズ
    },
  },
};
