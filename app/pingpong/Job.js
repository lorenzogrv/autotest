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
  if (!this.cp) return `Job#${basename(this.cmd)}`
  return `Job#${basename(this.cmd)}@${this.cp.pid}`
}

Job.start = function start () {
  if (this.cp) return this.restart()

  log.verb('%s: spawning child...', this)
  log.verb('%s %j', this.cmd, this.argv)

  var job = this

  var onExit = function (code) {
    if (job.cp === null) return
    log.warn('%s: still running on exit %s. Killing...', job, code)
    job.cp.kill()
  }

  process.on('exit', onExit)

  this.cp = spawn(this.cmd, this.argv, { stdio: this.stdio })
    .on('exit', function (code, signal) {
      log[code ? 'error' : 'info'](
        '%s: child exited with code %s and signal %s', job, code, signal
      )
      job.cp = null
      process.removeListener('exit', onExit)
      code && log.info('waiting for a change to restart...')
    })
    .on('error', function (err) {
      log.error('%s: child process %s error', job, this.pid, err.message)
      log.error(err.stack)
    })

  log.info('%s: spawned child with pid %s', this, this.cp.pid)

  if (!this.watch.length) return this
  log.info('%s: watching for changes on %s paths', this, this.watch.length)
  log.verb('watching %j', this.watch)

  watch(this.watch, {
    persistent: true,
    ignoreInitial: true
  })
    .on('all', function watcher (event, file) {
      this.close()
      log.verb('%s: watched %s %s', job, event, file)
      job.start()
    })
  return this
}

Job.restart = function restart () {
  if (!this.cp) throw new Error('this Job has no child process')
  log.info('%s: Killing child process to restart...', this)
  this.cp
    .once('exit', this.start.bind(this))
    .kill('SIGUSR2')
  return this
}
