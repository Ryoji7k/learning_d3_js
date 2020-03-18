import gulp from 'gulp';

/**
 * buildようにコピー
 */
gulp.task('copy:css', () => {
  return gulp.src('./.tmp/assets/*.css')
    .pipe(gulp.dest('./dist/assets/'));
});

/**
 * buildようにコピー
 */
gulp.task('copy:images', ['copy:css'], () => {
  return gulp.src('./src/assets/images/**/*')
    .pipe(gulp.dest('./dist/assets/images/'));
});

/**
 * buildようにコピー
 */
gulp.task('copy', ['copy:images'], () => {
  return gulp.src('./src/assets/movie/**/*')
    .pipe(gulp.dest('./dist/assets/movie/'));
});