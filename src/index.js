import _ from 'lodash';
import debugModule from 'debug';
import {basename} from 'path';
import globby from 'globby';
import videoExtensions from 'video-extensions';
import movieTitle from 'movie-title';
import omdb from 'omdb';
import throat from 'throat';
import pify from 'pify';
const debug = debugModule('movieList');

const DEFAULT_GLOB = [`**/*.{${videoExtensions.join(',')}}`, '!**/*{sample,Sample,rarbg.com,RARBG.com}*.*'];
const DEFAULT_CONCURRENT_REQUESTS = 15;

module.exports = ({movieGlob = DEFAULT_GLOB, source = process.cwd(), concurrentRequests = DEFAULT_CONCURRENT_REQUESTS} = {}) => {
  debug('resolved options: %j', {
    movieGlob,
    source,
    concurrentRequests
  });

  if (typeof concurrentRequests !== 'number') {
    throw new TypeError('concurrentRequests must be a number');
  }

  if (typeof source !== 'string') {
    throw new TypeError('source must be a string');
  }

  if (typeof movieGlob !== 'string' && !Array.isArray(movieGlob)) {
    throw new TypeError('movieGlob must be a string or a string array');
  }

  return globby(movieGlob, {cwd: source})
    .then(files => {
      debug('files found: %d', files.length);
      const getMovieData = file => {
        const movieInfo = {
          path: file,
          name: movieTitle(basename(file))
        };

        return pify(omdb.get)(movieInfo.name)
          .then(info => {
            movieInfo.info = info;

            if (!info) {
              const error = new Error('Movie not found');

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
          err => {
            return {
              state: 'failed',
              value: movieInfo,
              reason: err
            };
          });
      };

      return Promise.all(files.map(throat(concurrentRequests, getMovieData)));
    })
    .then(results => {
      debug('results: %j', results);

      return _(results)
        .groupBy('state')
        .mapValues((value, key) => key === 'succeeded' ? _.map(value, 'value') : value)
        .value();
    });
};