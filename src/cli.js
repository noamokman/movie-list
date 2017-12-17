import {isError} from 'util';
import program from 'caporal';
import chalk from 'chalk';
import _ from 'lodash';
import Table from 'cli-table2';
import updateNotifier from 'update-notifier';
import pkg from '../package.json';
import movieList, {saveKey} from '.';

const notifier = updateNotifier({pkg});

program.version(pkg.version)
  .description(pkg.description)
  .argument('[path]', 'Path to movies directory', null, process.cwd())
  .option('-s, --sort <property>', 'Sort by property (title|year|rating|runtime)', ['title', 'year', 'rating', 'runtime'], 'rating')
  .option('-o, --order <asc|desc>', 'Order of the sorting', ['asc', 'desc'], 'desc')
  .option('-t, --table', 'Prints the list in a table')
  .option('-j, --json', 'Prints the list data as json')
  .action(({path}, {sort, order, table, json}, logger) => movieList({source: path})
    .then(listData => {
      if (json) {
        logger.info(JSON.stringify(listData));

        return;
      }

      if (listData.succeeded) {
        const sortMap = {
          title: 'Title',
          year: 'Year',
          rating: 'imdbRating',
          runtime: 'Runtime'
        };

        logger.info(`Succeeded: ${listData.succeeded.length}`);
        listData.succeeded.sort((a, b) => {
          const orderIndicator = order === 'asc' ? 1 : -1;
          const prop = _.property(sortMap[sort]);

          const responseA = prop(a.info);
          const responseB = prop(b.info);

          return responseA > responseB ? orderIndicator : -orderIndicator;
        });

        const succeededTable = new Table({
          head: ['Title', 'Year', 'Rating', 'Genres', 'Runtime'],
          style: {
            head: []
          }
        });

        listData.succeeded.forEach(({info}) => {
          const output = [chalk.cyan(info.Title), info.Year, chalk.yellow(info.imdbRating), chalk.green(info.Genre), chalk.red(info.Runtime)];

          if (table) {
            succeededTable.push(output);
          }
          else {
            logger.info(...output);
          }
        });

        if (table) {
          logger.info(succeededTable.toString());
        }
      }

      if (listData.succeeded && listData.failed) {
        // Space line between succeeded and failed
        logger.info();
      }

      if (listData.failed) {
        const failedTable = new Table({
          head: ['Name', 'Error'],
          style: {
            head: []
          }
        });

        logger.info(`Failed: ${listData.failed.length}`);
        listData.failed.forEach(({value, reason}) => {
          const output = [chalk.cyan(value.name), chalk.red(isError(reason) ? reason : `Error: ${reason}`)];

          if (table) {
            failedTable.push(output);
          }
          else {
            logger.info(...output);
          }
        });

        if (table) {
          logger.info(failedTable.toString());
        }
      }

      notifier.notify();
    })
    .catch(err => {
      if (err.message === 'No api key provided') {
        err.message += ', save a key with `movie-list key my-key`';
      }

      if (json) {
        logger.info(JSON.stringify(isError(err) ? err : {err}));

        return;
      }

      console.error(chalk.red(isError(err) ? err : `Error: ${err}`));
    }))
  .command('key', 'set api key to omdb')
  .argument('<key>', 'The api key')
  .action(({key}, options, logger) => {
    saveKey({apiKey: key});
    logger.info(`Saved the given key: ${key} as the api key to omdb`);
  });

export default argv => {
  program
    .parse(argv);
};