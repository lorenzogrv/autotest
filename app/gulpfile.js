const gulp = require('gulp')
// const rename = require('gulp-rename')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
// const reduce = require('gulp-watchify-factor-bundle')
const watchify = require('watchify')
const browserify = require('browserify')
const sourcemaps = require('gulp-sourcemaps')

const abc = require('iai-abc')
const log = abc.log
const Job = require('./Job')

log.echo('Loading gulpfile @', process.pid)

const bOpts = {
  // TODO here magic should happen
  entries: ['./browser'],
  debug: true, // enable sourcemaps
  noParse: ['jquery'] // faster parsing for jquery
}

function bundler (b) {
  return b.bundle()
    // convert to a vinyl-source-stream
    // specify here the build file name so no rename its need on pipeline
    .pipe(source('bundle.js'))
    // this is needed by gulp-sourcemaps
    .pipe(buffer())
    // load maps from browserify bundle
    // TODO may using exorcist be simpler?
    .pipe(sourcemaps.init({ loadMaps: true }))
    // rename build to this name
    // .pipe(rename('bundle.js'))
    // write .map file
    .pipe(sourcemaps.write('./'))
    // save built files to this directory
    .pipe(gulp.dest('./www/js'))
}

gulp.task('build', function () {
  var b = browserify(bOpts)
    // catch out browserify errors
    .on('error', err => log.fatal(1, err.stack))
  return bundler(b)
})

gulp.task('watch:browser', function () {
  // this should be the same as build, but with watchify
  var b = watchify(browserify(abc.oop.extend(bOpts, watchify.args)))
    // log watchify messages
    .on('log', msg => log.echo('watchify bundler', msg))
    // catch out watchify uptates to re-bundle
    .on('update', () => log.warn('re-bundling...') + bundler(b))
  return bundler(b)
    .on('finish', function () {
      log.echo('watchify bundler will re-bundle on updates')
    })
})

gulp.task('watch:server', ['watch:browser'], function () {
  log.info('populating backend on require.cache...')
  // TODO abc.sources.from(reference, callback)
  // TODO abc.sources.from(reference) => stream files
  if (!abc.Log.muted) {
    abc.Log.muted = true
    require('./backend')
    abc.Log.muted = false
  } else {
    require('./backend')
  }
  Job('node', ['-e', 'require("./backend").listen(27780)'], {
    watch: abc.sources(require.cache[require.resolve('./backend')])
  })
    .start()
  // don't be async, Job will respawn server when needed as watchify does
})

gulp.task('watch:gulp', function () {
  // no need to populate gulpfile.js on require.cache as it's already required
  Job('gulp', ['--color', 'watch:server'], {
    stdio: 'pipe',
    watch: abc.sources(require.cache[require.resolve('./gulpfile.js')])
  })
    .start()
})

gulp.task('default', ['watch:gulp'])
