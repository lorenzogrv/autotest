const gulp = require('gulp')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const sourcemaps = require('gulp-sourcemaps')

module.exports = bundler

bundler.options = {
  // TODO here magic should happen
  entries: ['./browser'],
  debug: true, // enable sourcemaps
  noParse: ['jquery'] // faster parsing for jquery
}

function bundler (b) {
  // b.plugin('factor-bundle', {
  //   outputs: ['bundle/x', 'bundle/y']
  // })
  return b.bundle()
    // build name here avoids renaming downstream
    .pipe(source('bundle.js')) // convert to a vinyl-source-stream
    .pipe(buffer()) // buffer is needed by gulp-sourcemaps
    // load maps from browserify bundle TODO may using exorcist be simpler?
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./')) // write .map file
    .pipe(gulp.dest('./www/js')) // save built files to this directory
}
