'use strict';

import gulp from 'gulp';
import fs from 'fs';

fs.readdirSync('./gulp/tasks')
  .filter(filename => filename.match(/\.js$/i))
  .forEach(filename => require(`./gulp/tasks/${filename}`).default(gulp));