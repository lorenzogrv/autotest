const gulp = require('gulp')
const rename = require('gulp-rename')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const watchify = require('watchify')
const browserify = require('browserify')
const sourcemaps = require('gulp-sourcemaps')

const abc = require('iai-api')
const log = abc.log
const readkeys = abc.readkeys
const Job = require('./Job')

log.level = log.VERB

log.echo('Loading gulpfile @', process.pid)

const bOpts = {
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

gulp.task('factor', function () {
  return gulp.src('./content/*/*.js')
    .on('data', data => log.echo('src: %j', data) + log.echo('-------'))
    .on('end', () => log.echo('-------SOURCE END---------------------'))
    .pipe(rename('hola.js'))
    .on('data', data => log.echo('ren: %j', data) + log.echo('-------'))
    .on('end', () => log.echo('-RENAME-END---------------------------'))
    .pipe(gulp.dest('./www/js/testing'))
    .on('data', data => log.echo('des: %j', data) + log.echo('-------'))
    .on('end', () => log.echo('---DEST-END---------------------------'))
})

gulp.task('build', ['build:browser'])

gulp.task('build:browser', function () {
  var b = browserify(bOpts)
    // catch out browserify errors
    .on('error', err => log.fatal(1, err.stack))
  return bundler(b)
})

gulp.task('watch-build:browser', function () {
  // this should be the same as build, but with watchify
  var b = watchify(browserify(abc.oop.extend(bOpts, watchify.args)))
    // log watchify messages
    .on('log', msg => log.echo('watchify bundler', msg))
    // catch out watchify uptates to re-bundle
    .on('update', () => log.warn('re-bundling...') + bundler(b))

  return bundler(b).on('finish', function () {
    log.echo('watchify bundler will re-bundle on updates')
    process.once('SIGINT', () => {
      log.warn('stoping watchify...')
      b.close()
    })
  })
})

// spawns a job running the app server which restarts if backend sources change
gulp.task('job:server', [ /* 'watch:browser' */ ], function () {
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
  var keyboard = readkeys({ sigint: 12 })
    .on('finish', () => {
      log.warn('keystream has finish, unwatching job...')
      job.unwatch()
    })
    .on('end', () => log.warn('keystream has end'))
  var job = Job('node', ['./backend'], {
    stdio: 'pipe',
    stdin: process.stdin.pipe(keyboard),
    watch: abc.sources(require.cache[require.resolve('./backend')])
  })
    .on('close', () => {
      log.warn('server job has closed')
      log.warn('keyboard capture may still be active (Use Ctrl+L to finish)')
      log.warn('watcher will still be running if keyboard capture is active')
    })
    .start()
  return process.stdout
})

gulp.task('default', ['job:server'])

/* vim: set expandtab: */
/* vim: set filetype=javascript ts=2 shiftwidth=2: */
