'use strict';

import program from 'commander';
import chalk from 'chalk';
import pkg from './../package.json';
import util from 'util';
import _ from 'lodash';
import Table from 'cli-table2';
import updateNotifier from 'update-notifier';
const movieList = require('./');
const notifier = updateNotifier({pkg});

program.version(pkg.version)
  .description('Show a list of your movies sorted by rating')
  .usage('[options] [path]')
  .option('-s, --sort <property>', 'Sort by property (title|year|rating|runtime)', value => {
    const sortMap = {
      title: 'title',
      year: 'year',
      rating: 'imdb.rating',
      runtime: 'runtime'
    };

    return sortMap[value] || false;
  })
  .option('-o, --order <asc|desc>', 'Order of the sorting', value => value === 'asc' || value === 'desc' ? value : false)
  .option('-t, --table', 'Prints the list in a table')
  .option('-j, --json', 'Prints the list data as json')
  .option('-n, --no-color', 'Prints the list without colors');

/**
 * Handle cli arguments
 *
 * @param {string[]} argv - string array of the arguments
 */
module.exports = argv => {
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
    .then(listData => {
      if (program.json) {
        console.log(JSON.stringify(listData));

        return;
      }

      if (listData.succeeded) {
        if (!(program.sort && _.contains(['title', 'year', 'imdb.rating', 'runtime'], program.sort))) {
          program.sort = 'imdb.rating';
        }

        console.log(`Succeeded: ${listData.succeeded.length}`);
        listData.succeeded.sort((a, b) => {
          const order = program.order === 'asc' ? 1 : -1;
          const prop = _.property(program.sort);

          const responseA = prop(a.info);
          const responseB = prop(b.info);

          if (responseA < responseB) {
            return -order;
          }

          if (responseA > responseB) {
            return order;
          }

          return 0;
        });

        const succeededTable = new Table({
          head: ['Title', 'Year', 'Rating', 'Genres', 'Runtime'],
          style: {
            head: []
          }
        });

        listData.succeeded.forEach(result => {
          const info = result.info;
          const output = [chalk.cyan(info.title), info.year, chalk.yellow(info.imdb.rating), chalk.green(info.genres), chalk.red(info.runtime)];

          if (program.table) {
            succeededTable.push(output);
          }
          else {
            console.log(...output);
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
        const failedTable = new Table({
          head: ['Name', 'Error'],
          style: {
            head: []
          }
        });

        console.log(`Failed: ${listData.failed.length}`);
        listData.failed.forEach(result => {
          const output = [chalk.cyan(result.value.name), chalk.red(util.isError(result.reason) ? result.reason : `Error: ${result.reason}`)];

          if (program.table) {
            failedTable.push(output);
          }
          else {
            console.log(...output);
          }
        });

        if (program.table) {
          console.log(failedTable.toString());
        }
      }

      notifier.notify();
    })
    .catch(err => {
      if (program.json) {
        console.log(JSON.stringify(util.isError(err) ? err : {err}));

        return;
      }

      console.error(chalk.red(util.isError(err) ? err : `Error: ${err}`));
    });
};