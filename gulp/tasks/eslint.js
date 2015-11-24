'use strict';

import config from '../config';
import eslint from 'gulp-eslint';
import gulpIf from 'gulp-if';

const isFixed = file => file.eslint && file.eslint.fixed;

export default gulp => {
  gulp.task('eslint', ['eslint:src', 'eslint:test', 'eslint:gulp']);

  gulp.task('eslint:src', () => {
    return gulp.src(config.paths.src)
      .pipe(eslint({fix: true}))
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
      .pipe(gulpIf(isFixed, gulp.dest('src')));
  });

  gulp.task('eslint:test', () => {
    return gulp.src(config.paths.test)
      .pipe(eslint({fix: true}))
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
      .pipe(gulpIf(isFixed, gulp.dest('test')));
  });

  gulp.task('eslint:gulp', () => {
    return gulp.src(config.paths.gulp, {base: '.'})
      .pipe(eslint({fix: true}))
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
      .pipe(gulpIf(isFixed, gulp.dest('.')));
  });
};