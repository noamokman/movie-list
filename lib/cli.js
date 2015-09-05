'use strict';

var program = require('commander');
var chalk = require('chalk');
var pkg = require('./../package.json');
var util = require('util');
var movieList = require('./');
var _ = require('lodash');
var Table = require('cli-table2');

program.version(pkg.version)
  .description('Show a list of your movies sorted by rating')
  .usage('[options] [path]')
  .option('-s, --sort <property>', 'Sort by property (title|year|rating|runtime)', function (value) {
    var sortMap = {
      title: 'title',
      year: 'year',
      rating: 'imdb.rating',
      runtime: 'runtime'
    };

    return sortMap[value] || false;
  })
  .option('-o, --order <asc|desc>', 'Order of the sorting', function (value) {
    if (value === 'asc' || value === 'desc') {
      return value;
    }

    return false;
  })
  .option('-t, --table', 'Prints the list in a table')
  .option('-j, --json', 'Prints the list data as json')
  .option('-n, --no-color', 'Prints the list without colors');

/**
 * Handle cli arguments
 *
 * @param {string[]} argv - string array of the arguments
 */
module.exports = function (argv) {
  program
    .parse(argv);

  if (program.args.length) {
    program.path = program.args.shift();
  }

  if (program.sort === false) {
    console.error('  error: option `-s, --sort <property>\' argument invalid');

    return;
  }

  if (program.order === false) {
    console.error('  error: option `-o, --order <asc|desc>\' argument invalid');

    return;
  }

  movieList({source: program.path || process.cwd()})
    .then(function (listData) {
      if (program.json) {
        console.log(JSON.stringify(listData));

        return;
      }

      if (listData.succeeded) {
        if (!(program.sort && _.contains(['title', 'year', 'imdb.rating', 'runtime'], program.sort))) {
          program.sort = 'imdb.rating';
        }

        console.log('Succeeded: ' + listData.succeeded.length);
        listData.succeeded.sort(function (a, b) {
          var order = program.order === 'asc' ? 1 : -1;
          var prop = _.property(program.sort);

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

        var succeededTable = new Table({
          head: ['Title', 'Year', 'Rating', 'Genres', 'Runtime'],
          style: {
            head: []
          }
        });

        listData.succeeded.forEach(function (result) {
          var info = result.info;

          if (program.table) {
            succeededTable.push([chalk.cyan(info.title), info.year, chalk.yellow(info.imdb.rating), chalk.green(info.genres), chalk.red(info.runtime)]);
          }
          else {
            console.log(chalk.cyan(info.title), info.year, chalk.yellow(info.imdb.rating), chalk.green(info.genres), chalk.red(info.runtime));
          }
        });

        if (program.table) {
          console.log(succeededTable.toString());
        }
      }

      if (listData.succeeded && listData.failed) {
        // Space line between succeeded and failed
        console.log();
      }

      if (listData.failed) {
        var failedTable = new Table({
          head: ['Name', 'Error'],
          style: {
            head: []
          }
        });

        console.log('Failed: ' + listData.failed.length);
        listData.failed.forEach(function (result) {
          if (program.table) {
            failedTable.push([chalk.cyan(result.value.name), chalk.red(util.isError(result.reason) ? result.reason : 'Error: ' + result.reason)]);
          }
          else {
            console.log(chalk.cyan(result.value.name), chalk.red(util.isError(result.reason) ? result.reason : 'Error: ' + result.reason));
          }
        });

        if (program.table) {
          console.log(failedTable.toString());
        }
      }
    })
    .catch(function (err) {
      if (program.json) {
        console.log(JSON.stringify(util.isError(err) ? err : {err: err}));

        return;
      }

      console.error(chalk.red(util.isError(err) ? err : 'Error: ' + err));
    });
};