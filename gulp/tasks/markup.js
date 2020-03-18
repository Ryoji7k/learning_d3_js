import gulp from 'gulp';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import pug from 'gulp-pug';
import htmlHint from 'gulp-htmlhint';
import browserSync from 'browser-sync';

const reload = browserSync.reload;

let bs = null;

/**
 * markup用
 */
gulp.task('serve:markup', () => {
  bs = browserSync.init({
    notify: false,
    port: 9010,
    open: true,
    server: {
      baseDir: ['dist', '.tmp', 'src'],
      directory: false
    }
  });
  gulp.watch('src/pug/**/!(_)*.pug', ['pug']);
  gulp.watch('src/css/**/*.css', ['styles']);
  gulp.watch('src/javascripts/**/*.js', ['js:development']);
});


/**
 * pug to html
 */
gulp.task('pug', () => {
  return gulp.src('./src/pug/**/!(_)*.pug')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>') // lodashのtemplate記法で。
    }))
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest('./dist'))
    .pipe(htmlHint('.htmlhintrc'))
    .pipe(htmlHint.reporter())
    .pipe(reload({ stream: true }));
});
