'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _package = require('./../package.json');

var _package2 = _interopRequireDefault(_package);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _cliTable = require('cli-table2');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _updateNotifier = require('update-notifier');

var _updateNotifier2 = _interopRequireDefault(_updateNotifier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var movieList = require('./');
var notifier = (0, _updateNotifier2.default)({ pkg: _package2.default });

_commander2.default.version(_package2.default.version).description('Show a list of your movies sorted by rating').usage('[options] [path]').option('-s, --sort <property>', 'Sort by property (title|year|rating|runtime)', function (value) {
  var sortMap = {
    title: 'title',
    year: 'year',
    rating: 'imdb.rating',
    runtime: 'runtime'
  };

  return sortMap[value] || false;
}).option('-o, --order <asc|desc>', 'Order of the sorting', function (value) {
  return value === 'asc' || value === 'desc' ? value : false;
}).option('-t, --table', 'Prints the list in a table').option('-j, --json', 'Prints the list data as json').option('-n, --no-color', 'Prints the list without colors');

/**
 * Handle cli arguments
 *
 * @param {string[]} argv - string array of the arguments
 */
module.exports = function (argv) {
  _commander2.default.parse(argv);

  if (_commander2.default.args.length) {
    _commander2.default.path = _commander2.default.args.shift();
  }

  if (_commander2.default.sort === false) {
    console.error('  error: option `-s, --sort <property>\' argument invalid');

    return;
  }

  if (_commander2.default.order === false) {
    console.error('  error: option `-o, --order <asc|desc>\' argument invalid');

    return;
  }

  movieList({ source: _commander2.default.path || process.cwd() }).then(function (listData) {
    if (_commander2.default.json) {
      console.log(JSON.stringify(listData));

      return;
    }

    if (listData.succeeded) {
      (function () {
        if (!(_commander2.default.sort && _lodash2.default.contains(['title', 'year', 'imdb.rating', 'runtime'], _commander2.default.sort))) {
          _commander2.default.sort = 'imdb.rating';
        }

        console.log('Succeeded: ' + listData.succeeded.length);
        listData.succeeded.sort(function (a, b) {
          var order = _commander2.default.order === 'asc' ? 1 : -1;
          var prop = _lodash2.default.property(_commander2.default.sort);

          var responseA = prop(a.info);
          var responseB = prop(b.info);

          if (responseA < responseB) {
            return -order;
          }

          if (responseA > responseB) {
            return order;
          }

          return 0;
        });

        var succeededTable = new _cliTable2.default({
          head: ['Title', 'Year', 'Rating', 'Genres', 'Runtime'],
          style: {
            head: []
          }
        });

        listData.succeeded.forEach(function (result) {
          var info = result.info;
          var output = [_chalk2.default.cyan(info.title), info.year, _chalk2.default.yellow(info.imdb.rating), _chalk2.default.green(info.genres), _chalk2.default.red(info.runtime)];

          if (_commander2.default.table) {
            succeededTable.push(output);
          } else {
            var _console;

            (_console = console).log.apply(_console, output);
          }
        });

        if (_commander2.default.table) {
          console.log(succeededTable.toString());
        }
      })();
    }

    if (listData.succeeded && listData.failed) {
      // Space line between succeeded and failed
      console.log();
    }

    if (listData.failed) {
      (function () {
        var failedTable = new _cliTable2.default({
          head: ['Name', 'Error'],
          style: {
            head: []
          }
        });

        console.log('Failed: ' + listData.failed.length);
        listData.failed.forEach(function (result) {
          var output = [_chalk2.default.cyan(result.value.name), _chalk2.default.red(_util2.default.isError(result.reason) ? result.reason : 'Error: ' + result.reason)];

          if (_commander2.default.table) {
            failedTable.push(output);
          } else {
            var _console2;

            (_console2 = console).log.apply(_console2, output);
          }
        });

        if (_commander2.default.table) {
          console.log(failedTable.toString());
        }
      })();
    }

    notifier.notify();
  }).catch(function (err) {
    if (_commander2.default.json) {
      console.log(JSON.stringify(_util2.default.isError(err) ? err : { err: err }));

      return;
    }

    console.error(_chalk2.default.red(_util2.default.isError(err) ? err : 'Error: ' + err));
  });
};
//# sourceMappingURL=cli.js.map
