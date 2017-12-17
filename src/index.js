import {basename} from 'path';
import _ from 'lodash';
import debugModule from 'debug';
import globby from 'globby';
import videoExtensions from 'video-extensions';
import movieTitle from 'movie-title';
import omdb from 'omdb';
import pify from 'pify';
import pMap from 'p-map';
import MovieListError from './movie-list-error';

const debug = debugModule('movieList');
const getMovie = pify(omdb.get);
const getMovieData = file => {
  const movieInfo = {
    path: file,
    name: movieTitle(basename(file))
  };

  return getMovie(movieInfo.name)
    .then(info => {
      if (!info) {
        const err = new MovieListError('Movie not found');

        err.code = 'ENOMOVIE';

        return Promise.reject(err);
      }

      return {
        state: 'succeeded',
        value: {
          ...movieInfo,
          info
        }
      };
    })
    .catch(err => ({
      state: 'failed',
      value: movieInfo,
      reason: err
    }));
};

const DEFAULT_GLOB = [`**/*.{${videoExtensions.join(',')}}`, '!**/*{sample,Sample,rarbg.com,RARBG.com}*.*'];
const DEFAULT_CONCURRENT_REQUESTS = 15;

export default function ({movieGlob = DEFAULT_GLOB, source = process.cwd(), concurrentRequests = DEFAULT_CONCURRENT_REQUESTS} = {}) {
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

      return pMap(files, getMovieData, {concurrency: concurrentRequests});
    })
    .then(results => {
      debug('results: %j', results);

      return _(results)
        .groupBy('state')
        .mapValues((value, key) => key === 'succeeded' ? _.map(value, 'value') : value)
        .value();
    });
}