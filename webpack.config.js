module.exports = {
  // モード値を production に設定すると最適化された状態で、
  // development に設定するとソースマップ有効でJSファイルが出力される
  mode: 'development',
  entry: {
    main: './src/javascripts/main.js',
  },
  output: {
    filename: 'assets/[name].js',
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      { // for babel
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', { 'modules': false }]
              ]
            }
          }
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              bypassOnDebug: true, // webpack@1.x
              disable: true, // webpack@2.x and newer
              name: '[name].[ext]',
              outputPath: '/assets/images',
            },
          },
        ],
      },
      {
        test: /\.(mp4|ogv|webm)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            bypassOnDebug: true, // webpack@1.x
            disable: true, // webpack@2.x and newer
            name: '[name].[ext]',
            outputPath: '/assets/movie',
          },
        }, ],
      },
      {
        test: /\.glsl|vert|frag|vs|fs$/,
        exclude: /node_modules/,
        use: ['raw-loader', 'glslify-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json'],
    descriptionFiles: ['package.json'],
    enforceExtension: false,
    modules: ['node_modules'],
  }
};
