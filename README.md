# movie-list [![Build Status](https://travis-ci.org/noamokman/movie-list.svg?branch=master)](https://travis-ci.org/noamokman/movie-list) [![Coverage Status](https://coveralls.io/repos/github/noamokman/movie-list/badge.svg?branch=master)](https://coveralls.io/github/noamokman/movie-list?branch=master)
A node program to show a list of your movies sorted by rating

## Installation
As cli tool
```bash
$ [sudo] npm install movie-list -g
```

Programmatically
```bash
$ [sudo] npm install movie-list
```

## Usage
### CLI
```bash
$ movie-list 0.0.0 - A node program to show a list of your movies sorted by rating

```

### Programmatically
``` js
import movieList from 'movie-list';

movieList({source: '/path/to/movies/folder'})
  .then((listData) => {
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

[MIT](LICENSE) © [Noam Okman](https://github.com/noamokman)