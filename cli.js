var program = require('commander');
var chalk = require('chalk');
var pkg = require('./package.json');
var util = require('util');
var movieList = require('./');

function parseSort(value) {
  var sortMap = {
    title: 'Title',
    year: 'Year',
    rating: 'imdbRating',
    runtime: 'Runtime'
  };

  return sortMap[value] || false;
}

function parseOrder(value) {
  if (value === 'asc' || value === 'desc') {
    return value;
  }

  return false;
}

program
  .version(pkg.version)
  .description('A node program to show a list of your movies sorted by rating')
  .usage('[options] [path]')
  .option('-s, --sort <property>', 'Sort by property {title|year|rating|runtime}', parseSort)
  .option('-o, --order <asc|desc>', 'Order of the sorting', parseOrder)
  .option('-n, --no-color', 'Prints the list without colors')
  .parse(process.argv);

if (program.args.length) {
  program.path = program.args.shift();
}

var printOptions = {
  noColor: !program.color
};

if (program.sort === false) {
  console.error('  error: option `-s, --sort <property>\' argument invalid');
}
else if (program.order === false) {
  console.error('  error: option `-o, --order <asc|desc>\' argument invalid');
}
else {
  if (program.sort) {
    printOptions.sort = program.sort;
  }

  if (program.order) {
    printOptions.order = program.order;
  }

  movieList.listFolder(program.path || process.cwd())
    .then(function (listData) {
      movieList.printList(listData, printOptions);
    })
    .catch(function (err) {
      if (util.isError(err)) {
        console.error(chalk.red(err));
      } else {
        console.error(chalk.red('Error: ' + err));
      }
    });
}