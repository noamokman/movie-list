import {basename} from 'path';
import _ from 'lodash';
import debugModule from 'debug';
import globby from 'globby';
import videoExtensions from 'video-extensions';
import movieTitle from 'movie-title';
import OmdbApi from 'omdb-api-pt';
import pMap from 'p-map';
import Configstore from 'configstore';
import {name} from '../package.json';
import MovieListError from './movie-list-error';

const config = new Configstore(name);

const debug = debugModule('movieList');

const createMovieDataGetter = omdb => file => {
  const movieInfo = {
    path: file,
    name: movieTitle(basename(file))
  };

  return omdb.byId({title: movieInfo.name})
    .then(info => {
      if (!info || info.Response === 'False') {
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

export default function ({movieGlob = DEFAULT_GLOB, source = process.cwd(), concurrentRequests = DEFAULT_CONCURRENT_REQUESTS, apiKey = config.get('apiKey')} = {}) {
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

  if (!apiKey) {
    throw new MovieListError('No api key provided');
  }

  const omdb = new OmdbApi({
    apiKey
  });

  const getMovieData = createMovieDataGetter(omdb);

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

export function saveKey ({apiKey}) {
  config.set('apiKey', apiKey);
}