'use strict';

module.exports = {
  paths: {
    lib: './lib/**/*.js',
    test: './test/**/*.spec.js',
    gulp: ['./gulpfile.js', './gulp/**/*.js'],
    coverage: 'coverage/**/lcov.info',
    cliFile: './lib/cli.js'
  },
  manifests: ['./package.json']
};