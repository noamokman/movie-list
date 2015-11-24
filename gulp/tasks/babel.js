'use strict';

import config from '../config';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';

export default gulp => {
  gulp.task('babel', () => {
    return gulp.src(config.paths.src)
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('lib'));
  });
};