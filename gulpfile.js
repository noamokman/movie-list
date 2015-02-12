var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('default', ['test']);

gulp.task('test', ['jshint']);

gulp.task('jshint', function () {
  gulp.src('./*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});