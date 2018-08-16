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
  Job('node', ['./backend'], {
    stdio: 'pipe',
    stdin: readkeys(process.stdin),
    watch: abc.sources(require.cache[require.resolve('./backend')])
  })
    .start()
  // don't be async, Job will respawn server when needed as watchify does
  var finish = () => {
    log.warn('finishing job (will pause stdin now)')
    process.exitCode = 0
    process.stdin.pause()
  }
  process.on('SIGINT', finish)
  process.on('SIGUSR2', finish)
  return process.stdin
})

// spawns a job running gulp job:server task which restarts if gulpfile changes
gulp.task('watch-gulp:job:server', function () {
  // no need to populate gulpfile.js on require.cache as it's already required
  Job('gulp', ['--color', 'job:server'], {
    stdio: 'pipe',
    stdin: readkeys(process.stdin),
    watch: abc.sources(require.cache[require.resolve('./gulpfile.js')])
  })
    .start()
  var finish = () => {
    log.info('finishing job')
    process.exitCode = 0
    process.stdin.pause()
  }
  process.on('SIGINT', finish)
  abc.proc.ignoreSIGINT()
  process.on('SIGUSR2', finish)
  return process.stdin
})

// this is a bad idea
// gulp.task('default', ['watch-gulp:job:server'])

gulp.task('watch-gulp:factor', function () {
  // no need to populate gulpfile.js on require.cache as it's already required
  Job('gulp', ['--color', 'factor'], {
    stdio: 'pipe',
    await: true,
    watch: abc.sources(require.cache[require.resolve('./gulpfile.js')])
  })
    .start()
})

gulp.task('readkeys', function () {
  const { Transform } = require('stream')
  var keyboard = readkeys({ t: 5, humanize: true })
  process.stdin
    .pipe(keyboard)
    .on('timeout', () => {
      log.info('keyboard timed out, should gracefully close now')
    })
    // amazing way to push an extra newline character
    .pipe(new Transform({
      transform: (chunk, enc, cb) => cb(null, chunk.toString('utf8') + '\n')
    }))
    .pipe(process.stdout)
  return keyboard // end task when keyboard stream ends
})

gulp.task('readkeys-pipe', function () {
  var keyboard = readkeys({ input: null })
  Job('gulp', ['--color', 'readkeys'], {
    stdio: 'pipe',
    stdin: process.stdin.pipe(keyboard)
  }).start()
  // To start pipeline this way, option input must be set to null
  return keyboard
    .on('timeout', () => {
      log.info('keyboard timed out, should gracefully close now')
    })
})

gulp.task('readkeys-data', function () {
  return process.stdin
    .pipe(readkeys({ humanize: true }))
    .on('data', (data) => log.echo('data: "%s"', data))
    .on('end', () => log.echo('end') + process.stdin.pause())
})

gulp.task('readkeys-focuslost', function run () {
  return process.stdin
    .pipe(readkeys({ humanize: true }))
    .on('data', (data) => log.echo('data: "%s"', data))
    .once('focuslost', function first () { // once!!
      process.stdin.pause()
      log.echo('keyboard lost focus, paused stdin, resuming in 2 second')
      this.once('focuslost', () => {
        process.stdin.pause()
        log.echo('second focus lost, paused stdin, should exit normally')
      })
      setTimeout(() => log.echo('resume stdin') + process.stdin.resume(), 2000)
    })
    .on('end', () => {
      log.error('this event will never emit on this example')
    })
})
