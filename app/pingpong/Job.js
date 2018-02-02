var spawn = require('child_process').spawn
var watch = require('chokidar').watch

var oop = require('iai-oop')

var iai = require('iai-abc')

var log = iai.log
log.level = iai.Log.VERB

module.exports = Job

/**
 * @function boot: execute the main file of the commmonjs
 * module stored on the current working directory.
 */

Job.constructor = Job
Job.constructor.prototype = Job

function Job (cmd, argv, opts) {
  var instance = Object.create(Job)

  argv = argv || []

  oop(instance)
    .internal('cp', null)
    .internal('cmd', cmd)
    .internal('argv', Array.isArray(argv) ? argv : [argv])

  return instance
}

Job.start = function start () {
  if (this.cp) return this.restart()

  log.info('Spawning child process (%s %j)', this.cmd, this.argv)
  this.cp = spawn(this.cmd, this.argv, { stdio: 'inherit' })

  var job = this
  this.cp
    .on('exit', function (code, signal) {
      job.cp = null
      log[code ? 'error' : 'info'](
        'Child %s exited with code %s and signal %s', this.pid, code, signal
      )
      code && log.info('waiting for a change to restart...')
    })
    .on('error', function (err) {
      log.error('Child process %s error', this.pid, err.message)
      log.error(err.stack)
    })

  log.info('watching for changes on %s', process.cwd())
  watch(process.cwd(), {
    persistent: true,
    ignoreInitial: true
  })
    .on('all', function watcher (event, file) {
      this.close()
      log.verb('watched a %s on %s', event, file)
      job.start()
    })
  return this
}

Job.restart = function restart () {
  if (!this.cp) throw new Error('this Job has no child process')
  log.info('Killing child process %s to restart...', this.cp.pid)
  this.cp
    .once('exit', this.start.bind(this))
    .kill('SIGUSR2')
  return this
}
