'use strict';

import runSequence from 'run-sequence';

export default gulp => {
  gulp.task('build', cb => {
    runSequence(
      'clean',
      'babel',
      cb
    );
  });
};