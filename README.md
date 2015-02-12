# movie-list [![Build Status](https://travis-ci.org/noamokman/movie-list.svg)](https://travis-ci.org/noamokman/movie-list)

A node program to show a list of your movies sorted by rating

## Installation

``` bash
  $ [sudo] npm install movie-list -g
```

## Usage
There are two distinct ways to use movie-list: through the command line interface, or by requiring the movie-list module in your own code.

### Using movie-list from the command line
The usage options are simple:

```
  $ movie-list --help
  Usage: movie-list [options] [path]

  A node program to show a list of your movies sorted by rating

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -s, --sort <property>   Sort by property {title|year|rating|runtime}
    -o, --order <asc|desc>  Order of the sorting
    -n, --no-color          Prints the list without colors
```

The path parameter is optional and takes the current working directory as default.

## Using movie-list module from node.js
``` bash
  $ [sudo] npm install movie-list --save
```
The movie-list module exposes some useful methods. See the [movie-list cli commands][https://github.com/noamokman/movie-list/blob/master/cli.js] for sample usage.
* [`listFolder`](#listFolder)
* [`listArray`](#listArray)
* [`printList`](#printList)

<a name="listFolder" />
### listFolder(path, callback)

Reads all files and folders in the `path` and passes an array to the [`listArray`](#listArray) function.

__Arguments__

* `path` - The path of the folder to list.
* `callback(err, listData)` - An optional callback which is called when the `listData` is built, or an error occurs.

__Returns__

A `promise` that is _resolved_ with the `listData` or _rejected_ if an error occurs.

__Examples__

Working with _callbacks_:
```js
var movieList = require('movie-list');

movieList.listFolder('/path/to/movies/folder', function(err, listData){
  console.log(listData);
});
```

Working with _promises_:
```js
var movieList = require('movie-list');

movieList.listFolder('/path/to/movies/folder')
  .then(function(listData){
    console.log(listData);
  });
```

<a name="listArray" />
### listArray(movieFileNames, callback)

Takes the `movieFileNames`, extracts the movie name with [movie-title](https://github.com/danielhusar/movie-title),
And get the necessary data for each movie.

__Arguments__

* `movieFileNames` - An _array_ of the movies file names.
* `callback(err, listData)` - An optional callback which is called when the `listData` is built, or an error occurs.

__Returns__

A `promise` that is _resolved_ with the `listData` or _rejected_ if an error occurs.

__Examples__

Working with _callbacks_:
```js
var movieList = require('movie-list');

movieList.listArray(['Fury.2014.720p.WEB-DL.DD5.1.H264-RARBG', 'Taken 3 2014 1080p WEB-DL x264-PartyBoy', ...], function(err, listData) {
  console.log(listData);
});
```

Working with _promises_:
```js
var movieList = require('movie-list');

movieList.listArray(['Fury.2014.720p.WEB-DL.DD5.1.H264-RARBG', 'Taken 3 2014 1080p WEB-DL x264-PartyBoy', ...])
  .then(function(listData) {
    console.log(listData);
  });
```

<a name="printList" />
### printList(listData, options)

Takes the `listData`, and prints it.

__Arguments__

* `listData` - The list data object.
* `options` - An optional object to set print setting by these parameters:

Option    | Description                    | Default      | Values
-------   | ------------------------------ | ------------ | -----------
sort      | Sort by property               | `imdbRating` | title, year, rating, runtime
order     | Order of the sorting           | `desc`       | asc, desc
noColor   | Prints the list without colors | `false`      | true, false

__Examples__

```js
var movieList = require('movie-list');

movieList.listArray(['Fury.2014.720p.WEB-DL.DD5.1.H264-RARBG', 'Taken 3 2014 1080p WEB-DL x264-PartyBoy', ...], function(err, listData) {
  movieList.listArray(listData);
});
```

```js
var movieList = require('movie-list');

movieList.listArray(['Fury.2014.720p.WEB-DL.DD5.1.H264-RARBG', 'Taken 3 2014 1080p WEB-DL x264-PartyBoy', ...])
  .then(function(listData) {
    movieList.listArray(listData, {
      noColor: true
    });
  });
```

## Run Tests

``` bash
  $ npm test
```

#### License: MIT
#### Author: [Noam Okman](https://github.com/noamokman)