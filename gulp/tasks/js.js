import gulp from 'gulp';
import webpackStream from 'webpack-stream';
import webpack from 'webpack';
import browserSync from 'browser-sync';
import util from 'gulp-util';
import webpackConfig from '../../webpack.config';

const reload = browserSync.reload;

// webpack for javascripts
gulp.task('js:development', () => {
  webpackBundle('development');
});

gulp.task('js:production', () => {
  webpackBundle('production');
});

function webpackBundle(mode) {
  // webpackの設定ファイルの読み込み
  webpackConfig.mode = mode; // set development or production

  webpack(webpackConfig, (err, stats) => {
    if (err) {
      throw new util.PluginError('webpack', err);
    }

    browserSync.reload();

    const jsonStats = stats.toJson();
    if (jsonStats.errors.length) {
      jsonStats.errors.forEach(error => util.log(util.colors.bgRed('webpack:error'), util.colors.magenta(error)));
      return;
    }
    if (jsonStats.warnings.length) {
      jsonStats.warnings.forEach(warning => util.log(util.colors.bgRed('webpack:warning'), util.colors.magenta(warning)));
    }

    util.log('webpack', stats.toString({
      hash: false,
      version: false,
      chunks: false,
      reasons: true,
      colors: true
    }));
  });
}
