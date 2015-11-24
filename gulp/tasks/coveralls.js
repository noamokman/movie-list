'use strict';

import config from '../config';
import coveralls from 'gulp-coveralls';

export default gulp => {
  gulp.task('coveralls', () => {
    return gulp.src(config.paths.coverage)
      .pipe(coveralls());
  });
};