'use strict';

import del from 'del';

export default gulp => {
  gulp.task('clean', () => {
    return del('lib');
  });
};
