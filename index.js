var movie = require('node-movie');
var _ = require('lodash');
var fs = require('fs');
var movieTitle = require('movie-title');
var async = require('async');
var chalk = require('chalk');
var Q = require('q');

function listFolder(path, callback) {
  callback = callback || _.noop;
  var deferred = Q.defer();

  fs.readdir(path, function (err, files) {
    if (err) {
      deferred.reject(err);
      return callback(err);
    } else {
      deferred.resolve(listArray(files, callback));
    }
  });

  return deferred.promise;
}

function listArray(movieFileNames, callback) {
  callback = callback || _.noop;
  var deferred = Q.defer();

  var movies = _.map(movieFileNames, movieTitle);

  async.map(movies, function (movieName, cb) {
    movie(movieName, function (err, data) {
      if (err) {
        return cb(err);
      }

      cb(null, {
        title: movieName,
        response: data
      });
    });
  }, function (err, results) {
    if (err) {
      deferred.reject(err);
      return callback(err);
    }

    var data = _.groupBy(results, function (result) {
      return result.response.Response === 'True' ? 'succeeded' : 'failed';
    });

    deferred.resolve(data);
    return callback(null, data);
  });

  return deferred.promise;
}

function printList(listData, options) {
  options = options || {};

  if (listData.succeeded) {
    if (!(options.sort && _.contains(['Title', 'Year', 'imdbRating', 'Runtime'], options.sort))) {
      options.sort = 'imdbRating';
    }

    console.log('Succeeded: ' + listData.succeeded.length);
    listData.succeeded.sort(function (a, b) {
      var order = options.order === 'asc' ? 1 : -1;

      var responseA = a.response[options.sort];
      var responseB = b.response[options.sort];

      if (options.sort === 'Runtime') {
        responseA = parseInt(_.trimRight(responseA, ' min'));
        responseB = parseInt(_.trimRight(responseB, ' min'));
      }

      if (responseA < responseB)
        return -order;
      if (responseA > responseB)
        return order;
      return 0;
    });
    listData.succeeded.forEach(function (result) {
      var response = result.response;
      if (options.noColor) {
        console.log(response.Title, response.Year, response.imdbRating, response.Genre, response.Runtime);
      }
      else {
        console.log(chalk.cyan(response.Title), response.Year, chalk.yellow(response.imdbRating), chalk.green(response.Genre), chalk.red(response.Runtime));
      }
    });
  }
  if (listData.succeeded && listData.failed) {
    // Space between Succeeded and failed
    console.log();
  }
  if (listData.failed) {
    console.log('Failed: ' + listData.failed.length);
    listData.failed.forEach(function (result) {
      if (options.noColor) {
        console.log(result.title, 'Error: ' + result.response.Error);
      }
      else {
        console.log(chalk.cyan(result.title), chalk.red('Error: ' + result.response.Error));
      }
    });
  }
}

module.exports = {
  listFolder: listFolder,
  listArray: listArray,
  printList: printList
};