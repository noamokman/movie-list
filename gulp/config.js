'use strict';

export default {
  paths: {
    lib: './lib/**/*.js',
    src: './src/**/*.js',
    test: './test/**/*.spec.js',
    gulp: ['./gulpfile.babel.js', './gulp/**/*.js'],
    coverage: 'coverage/**/lcov.info',
    cliFile: './src/cli.js'
  },
  manifests: ['./package.json']
};