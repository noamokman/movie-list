var movie = require('node-movie');
var _ = require('lodash');
var fs = require('fs');
var movieTitle = require('movie-title');
var async = require('async');
var chalk = require('chalk');
var path = require('path');
var Q = require('q');

var fileExtensions = ['.webm', '.mkv', '.flv', '.vob', '.ogv', '.ogg', 'b.rc',
  '.mng', '.avi', '.mov', '.qt', '.wmv', '.wuv', '.rm', '.rmvb', '.asf',
  '.mp4', '.m4p', '.m4v', '.mpg', '.mp2', '.mpeg', '.mpe', '.mpg', '.m2v',
  '.svi', '.3gp', '.3g2', '.mxf', '.roq', '.nsv'];

var knownSamples = ['sample', 'rarbg.com'];

function listFolder(dirPath, callback) {
  callback = callback || _.noop;
  var deferred = Q.defer();

  listFolderInternal(dirPath).then(function (files) {
    var filtered = _.filter(files, function (file) {
      return isMovie(file) && !isSample(file);
    });
    deferred.resolve(listArray(filtered, callback));
  }).fail(function (err) {
    callback(err);
    deferred.reject(err);
  });

  return deferred.promise;
}

function isMovie(file) {
  return fileExtensions.indexOf(path.extname(file).toLowerCase()) !== -1;
}

function isSample(file) {
  return knownSamples.indexOf(path.basename(file, path.extname(file)).toLowerCase()) !== -1;
}

function listFolderInternal(dirPath) {
  var deferred = Q.defer();

  fs.readdir(dirPath, function (err, dirs) {
    if (err) {
      return deferred.reject(err);
    } else {
      dirs = _.map(dirs, function (dir) {
        return path.join(dirPath, dir);
      });

      async.map(dirs, function (dir, callback) {
        fs.stat(dir, function (err, stat) {
          if (err) {
            return callback(err);
          }

          callback(null, { dir: dir, stat: stat });
        })
      }, function (err, dirStats) {
        var files = [];
        var promises = [];

        _.forEach(dirStats, function (dirStat) {
          if (dirStat.stat.isDirectory()) {
            promises.push(listFolderInternal(dirStat.dir));
          } else {
            files.push(dirStat.dir);
          }
        });

        Q.all(promises).then(function (directories) {
          var directoriesFiles = _.flattenDeep(directories);
          files = files.concat(directoriesFiles);

          deferred.resolve(files);
        });
      });
    }
  });

  return deferred.promise;
}

function listArray(movieFilePaths, callback) {
  callback = callback || _.noop;
  var deferred = Q.defer();

  var movies = _.map(movieFilePaths, function (moviePath) {
    return {
      path: moviePath,
      title: movieTitle(path.basename(moviePath))
    }
  });

  async.map(movies, function (movieInfo, cb) {
    movie(movieInfo.title, function (err, data) {
      if (err) {
        return cb(err);
      }

      cb(null, {
        title: movieInfo.title,
        path: movieInfo.path,
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
      else if (options.sort === 'imdbRating') {
        if(responseA === 'N/A')
        {
          return 1;
        }
        if(responseB === 'N/A')
        {
          return -1;
        }
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