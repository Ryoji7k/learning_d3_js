import path from 'path';
import gulp from 'gulp';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import nested from 'postcss-nested';
import postcss from 'gulp-postcss';
import postcssPresetEnv from 'postcss-preset-env';
import _import from 'postcss-easy-import';
import assets from 'postcss-assets';
import short from 'postcss-short';
import autoprefixer from 'autoprefixer';
import stylelint from 'stylelint';
import doiuse from 'doiuse';
import sprites, { updateRule } from 'postcss-sprites';
import reporter from 'postcss-reporter';
import csso from 'postcss-csso';

import sourcemaps from 'gulp-sourcemaps';

const reload = browserSync.reload;

// @see http://browserl.ist/?q=ie+%3E%3D+11%2C+last+2+edge+version%2C+last+2+ff+version%2C+last+2+chrome+version%2C+safari+%3E%3D+10%2C+ios+%3E%3D+9%2C+last+2+ChromeAndroid+version
const browsers = [
  'ie >= 11',
  'last 2 edge version',
  'last 2 ff version',
  'last 2 chrome version',
  'safari >= 10',
  'ios >= 9',
  'last 2 ChromeAndroid version'
];

let latestFilePath = '';
const processors = [
  _import({
    glob: true
  }),
  short,
  nested,
  postcssPresetEnv({
    stage: 0,
    browsers
  }),
  autoprefixer({ browsers }),
  assets({
    basePath: 'src',
    loadPaths: ['assets/'],
    relativeTo: 'src'
  }),
  sprites({
    stylesheetPath: 'src/assets/', // 出力するcssのパス
    spritePath: 'src/assets',   // スプライト画像を出力する先のパス
    basePath: 'src/',  // urlのベースパス
    relativeTo: 'src',
    retina: true,
    // assets/spritesのみスプライトの対象とする
    filterBy: (image) => {
      // onSaveSpritesheetでファイル名を利用したいためここでパスを取得する
      latestFilePath = image.styleFilePath;
      if (/images\/sprites/.test(image.url)) {
        return Promise.resolve();
      }
      return Promise.reject();
    },
    groupBy(image) {
      if (image.url.indexOf('@2x') === -1) {
        return Promise.resolve('@1x');
      }
      return Promise.resolve('@2x');
    },
    spritesmith: {
      padding: 10
    },
    hooks: {
      // 出力されるスプライト画像ファイル名を変更する sprite@2xだと同じファイルが量産されるので
      onSaveSpritesheet(opts, data) {
        // 各ファイルごとでsprite画像のファイルパスを変える
        const filename = path.basename(latestFilePath, '.css');
        if (data.groups[0] === '@1x') {
          // 通常サイズのスプライト
          return path.join(opts.spritePath, `_${filename}_sprites.png`);
        } else {
          // retinaサイズのスプライト
          return path.join(opts.spritePath, `_${filename}_sprites@2x.png`);
        }
      }
    }
  }),
  reporter({ clearMessages: true })
];

// --------------------------POST CSS--------------------------
gulp.task('stylelint', () => {
  return gulp.src('./src/css/**/*.css')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(postcss([
      stylelint,
      doiuse({
        browsers,
        ignore: ['flexbox', 'css-media-resolution', 'calc', 'css-resize', 'viewport-units', 'object-fit', 'outline', 'css-appearance'],
        ignoreFiles: ['**/node_modules/**/*.css', '**/src/css/libs/**/*.css']
      }),
      reporter({ clearReportedMessages: true }) // 他プロジェクトにあるプロパティ:clearMessagesはない
    ]));
});

gulp.task('styles', ['stylelint'], () => {
  return gulp.src('./src/css/*.css')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/assets'))
    .pipe(reload({ stream: true, match: '**/*.css' }));
});

gulp.task('styles:prod', ['stylelint'], () => {
  // minifyの設定を追加
  processors.push(csso);

  return gulp.src('./src/css/*.css')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(postcss(processors))
    .pipe(gulp.dest('.tmp/assets'));
});
