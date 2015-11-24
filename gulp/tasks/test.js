'use strict';

import mocha from 'gulp-mocha';
import istanbul from 'gulp-babel-istanbul';
import mergeStream from 'merge-stream';
import babel from 'gulp-babel';
import config from '../config';

export default gulp => {
  gulp.task('test', ['eslint'], cb => {
    mergeStream(
      gulp.src([`!${config.paths.cliFile}`].concat(config.paths.src))
        .pipe(istanbul({
          includeUntested: true
        })),
      gulp.src(config.paths.test)
        .pipe(babel())
    )
      .pipe(istanbul.hookRequire())
      .on('finish', () => {
        gulp.src(config.paths.test)
          .pipe(mocha({reporter: 'spec'}))
          .pipe(istanbul.writeReports())
          .pipe(istanbul.enforceThresholds({thresholds: {global: 100}}))
          .on('end', cb);
      });
  });
};
