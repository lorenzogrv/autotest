const { basename } = require('path')
var spawn = require('child_process').spawn
var watch = require('chokidar').watch

var oop = require('iai-oop')
var iai = require('iai-abc')

var log = iai.log
log.level = iai.Log.INFO

module.exports = Job

/**
 * @function Job: builds a wrap to run a child_process job
 */

Job.constructor = Job
Job.constructor.prototype = Job

function Job (cmd, argv, opts) {
  var instance = Object.create(Job)

  argv = argv || []
  opts = opts || {}
  opts.watch = opts.watch || []

  oop(instance)
    .internal('cp', null)
    .internal('cmd', cmd)
    .internal('argv', Array.isArray(argv) ? argv : [argv])
    .internal('stdio', opts.stdio || 'inherit')
    .internal('watch', Array.isArray(opts.watch) ? opts.watch : [opts.watch])

  if (!Array.isArray(opts.watch)) opts.watch = [opts.watch]

  return instance
}

Job.toString = function () {
  if (!this.cp) {
    return 'Job#' + basename(this.cmd)
  }
  return basename(this.cmd) + '@' + this.cp.pid
}

Job.start = function start () {
  if (this.cp) return this.restart()

  var job = this

  var onExit = function (code) {
    if (job.cp === null) return
    log.warn('%s is still running on exit %s. Killing...', job, code)
    job.cp.kill()
  }

  process.on('exit', onExit)

  log.warn('%s spawning now...', this)
  log.info('>', this.cmd, this.argv.join(' '))

  this.cp = spawn(this.cmd, this.argv, { stdio: this.stdio })
    .on('exit', function (code, signal) {
      log[code ? 'error' : 'info'](
        '%s exited with code %s and signal %s', job, code, signal
      )
      job.cp = null
      process.removeListener('exit', onExit)
      code && log.info('waiting for a change to restart...')
    })
    .on('error', function (err) {
      log.error('%s: child process %s error', job, this.pid, err.message)
      log.error(err.stack)
    })

  log.info('%s spawned successfully', this)

  if (this.stdio === 'pipe') {
    // TODO pipe into log api?
    var writer = function (stream) {
      var bol = true // begin of line
      return function (data) {
        data = data.toString('utf8')
        stream.write(
          bol ? iai.f('%s: %s', job, data) : data
        )
        bol = !!~data.indexOf('\n')
      }
    }
    this.cp.stdout.on('data', writer(process.stdout))
    this.cp.stderr.on('data', writer(process.stderr))
  }

  if (!this.watch.length) {
    return this
  }

  log.warn('%s is watching for changes on %s paths', this, this.watch.length)
  watch(this.watch, { persistent: true, ignoreInitial: true })
    .on('all', function watcher (event, file) {
      this.close() // close the watcher, restart will spawn a new one
      log.info('%s watched %s %s', job, event, file)
      job.restart()
    })
  return this
}

Job.restart = function restart () {
  if (!this.cp) throw new Error('this Job has no child process')
  log.warn('%s is being killed to restart...', this)
  this.cp
    .once('exit', this.start.bind(this))
    .kill('SIGUSR2')
  return this
}
