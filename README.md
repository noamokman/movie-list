# movie-list

A node program to show a list of your movies sorted by rating

<table>
  <thead>
    <tr>
      <th>Linux</th>
      <th>OSX</th>
      <th>Coverage</th>
      <th>Dependencies</th>
      <th>DevDependencies</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2" align="center">
        <a href="https://travis-ci.org/noamokman/movie-list"><img src="https://img.shields.io/travis/noamokman/movie-list.svg?style=flat-square"></a>
      </td>
      <td align="center">
<a href='https://coveralls.io/r/noamokman/movie-list'><img src='https://img.shields.io/coveralls/noamokman/movie-list.svg?style=flat-square' alt='Coverage Status' /></a>
      </td>
      <td align="center">
        <a href="https://david-dm.org/noamokman/movie-list"><img src="https://img.shields.io/david/noamokman/movie-list.svg?style=flat-square"></a>
      </td>
      <td align="center">
        <a href="https://david-dm.org/noamokman/movie-list#info=devDependencies"><img src="https://img.shields.io/david/dev/noamokman/movie-list.svg?style=flat-square"/></a>
      </td>
    </tr>
  </tbody>
</table>


## Installation
As cli tool
``` bash
$ [sudo] npm install movie-list -g
```

Programmatically
``` bash
$ [sudo] npm install movie-list --save
```

## Usage
### CLI
``` bash
$ movie-list --help

  Usage: movie-list [options] [path]

  Show a list of your movies sorted by rating

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -s, --sort <property>   Sort by property (title|year|rating|runtime)
    -o, --order <asc|desc>  Order of the sorting
    -t, --table             Prints the list in a table
    -j, --json              Prints the list data as json
    -n, --no-color          Prints the list without colors

```

### Programmatically
``` js
var movieList = require('movie-list');

movieList({source: '/path/to/movies/folder'})
  .then(function (listData) {
    // listData -> data found on the movies
  });
```

#### Options
Option              | Description                                       | Default
------------------- | ------------------------------------------------- | ---------
movieGlob           | The glob to use when searching movie files, built with [video-extensions](https://www.npmjs.com/package/video-extensions)| `['**/*.{' + videoExtensions.join(',') + '}', '!**/*{sample,Sample,rarbg.com,RARBG.com}*.*']`
source              | the path to the movies folder, glob searches here | `process.cwd()`
concurrentRequests  | Number of concurrent requests to omdb             | 15

## License

[MIT](LICENSE)
