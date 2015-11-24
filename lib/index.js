'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _videoExtensions = require('video-extensions');

var _videoExtensions2 = _interopRequireDefault(_videoExtensions);

var _movieTitle = require('movie-title');

var _movieTitle2 = _interopRequireDefault(_movieTitle);

var _omdb = require('omdb');

var _omdb2 = _interopRequireDefault(_omdb);

var _throat = require('throat');

var _throat2 = _interopRequireDefault(_throat);

var _pinkiePromise = require('pinkie-promise');

var _pinkiePromise2 = _interopRequireDefault(_pinkiePromise);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('movieList');
var throat = (0, _throat2.default)(_pinkiePromise2.default);

var DEFAULT_GLOB = ['**/*.{' + _videoExtensions2.default.join(',') + '}', '!**/*{sample,Sample,rarbg.com,RARBG.com}*.*'];
var DEFAULT_CONCURRENT_REQUESTS = 15;

/**
 * Generate a movie list from given options
 *
 * @param {Glob} movieGlob Options to locate the movies like source folder or glob to use
 * @param {String} source Options to locate the movies like source folder or glob to use
 * @param {Number} concurrentRequests Options to locate the movies like source folder or glob to use
 * @returns {Promise} The promise to the movie list data
*/
module.exports = function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$movieGlob = _ref.movieGlob;
  var movieGlob = _ref$movieGlob === undefined ? DEFAULT_GLOB : _ref$movieGlob;
  var _ref$source = _ref.source;
  var source = _ref$source === undefined ? process.cwd() : _ref$source;
  var _ref$concurrentReques = _ref.concurrentRequests;
  var concurrentRequests = _ref$concurrentReques === undefined ? DEFAULT_CONCURRENT_REQUESTS : _ref$concurrentReques;

  debug('resolved options: %j', {
    movieGlob: movieGlob,
    source: source,
    concurrentRequests: concurrentRequests
  });

  return (0, _globby2.default)(movieGlob, { cwd: source }).then(function (files) {
    debug('files found: %d', files.length);
    var getMovieData = function getMovieData(file) {
      var movieInfo = {
        path: file,
        name: (0, _movieTitle2.default)(_path2.default.basename(file))
      };

      return (0, _pify2.default)(_omdb2.default.get)(movieInfo.name).then(function (info) {
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
      }, function (err) {
        return {
          state: 'failed',
          value: movieInfo,
          reason: err
        };
      });
    };

    return _pinkiePromise2.default.all(files.map(throat(getMovieData, concurrentRequests)));
  }).then(function (results) {
    debug('results: %j', results);

    return (0, _lodash2.default)(results).groupBy('state').mapValues(function (value, key) {
      return key === 'succeeded' ? _lodash2.default.pluck(value, 'value') : value;
    }).value();
  });
};
//# sourceMappingURL=index.js.map
