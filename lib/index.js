'use strict';

var debug = require('debug')('movieList');
var _ = require('lodash');
var path = require('path');
var globby = require('globby');
var videoExtensions = require('video-extensions');
var movieTitle = require('movie-title');
var omdb = require('omdb');
var Q = require('q');
var throat = require('throat')(require('pinkie-promise'));

/**
 * Generate a movie list from given options
 *
 * @param {Object} options Options to locate the movies like source folder or glob to use
 * @returns {Q.promise} The promise to the movie list data
 */
module.exports = function (options) {
  if (options && typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }

  debug('given options: %j', options);
  options = _.defaultsDeep(options || {}, {
    movieGlob: ['**/*.{' + videoExtensions.join(',') + '}', '!**/*{sample,Sample,rarbg.com,RARBG.com}*.*'],
    source: process.cwd(),
    concurrentRequests: 15
  });
  debug('resolved options: %j', options);

  return globby(options.movieGlob, {cwd: options.source})
    .then(function (files) {
      debug('files found: %d', files.length);
      var getMovieData = function (file) {
        var movieInfo = {
          path: file,
          name: movieTitle(path.basename(file))
        };

        return Q.nfcall(omdb.get, movieInfo.name)
          .then(function (info) {
            movieInfo.info = info;

            if (!info) {
              var error = new Error('Movie not found');

              error.code = 'ENOMOVIE';

              return {
                state: 'failed',
                value: movieInfo,
                reason: error
              };
            }

            return {
              state: 'succeeded',
              value: movieInfo
            };
          },
          function (err) {
            return {
              state: 'failed',
              value: movieInfo,
              reason: err
            };
          });
      };

      return Q.all(files.map(throat(getMovieData, options.concurrentRequests)));
    })
    .then(function (results) {
      debug('results: %j', results);

      return _(results)
        .groupBy('state')
        .mapValues(function (value, key) {
          if (key === 'succeeded') {
            return _.pluck(value, 'value');
          }

          return value;
        })
        .value();
    });
};