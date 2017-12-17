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
$  movie-list 0.0.0 - A node program to show a list of your movies sorted by rating
     
   USAGE

     movie-list [path]

   ARGUMENTS

     [path]      Path to movies directory      optional      default: "D:\\Downloads"

   OPTIONS

     -s, --sort <property>       Sort by property (title|year|rating|runtime)      optional      default: "rating"
     -o, --order <asc|desc>      Order of the sorting                              optional      default: "desc"  
     -t, --table                 Prints the list in a table                        optional                       
     -j, --json                  Prints the list data as json                      optional                       

   COMMANDS

     key <key>           set api key to omdb                
     help <command>      Display help for a specific command

   GLOBAL OPTIONS

     -h, --help         Display help                                      
     -V, --version      Display version                                   
     --no-color         Disable colors                                    
     --quiet            Quiet mode - only displays warn and error messages
     -v, --verbose      Verbose mode - will also output debug messages    
```

### Programmatically
``` js
import movieList from 'movie-list';

movieList.saveKey({apiKey: 'my-key'});

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
apiKey              | The api key to use                                | Tries to get the value saved from the `saveKey` function


## Api key
This library uses [omdb]() behind the scenes.
You need to create a key [here]().
Save the key with: `movie-list key my-key`.

## License

[MIT](LICENSE) © [Noam Okman](https://github.com/noamokman)