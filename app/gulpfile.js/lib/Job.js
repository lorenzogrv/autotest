const { basename, relative } = require('path')
const { EventEmitter } = require('events')
const spawn = require('child_process').spawn
const watch = require('chokidar').watch

const oop = require('iai-oop')
const iai = require('iai-abc')

var log = iai.log
// log.level = log.VERB

module.exports = Job

/**
 * @function Job: builds a wrap to run a child_process job
 */

Job.prototype = new EventEmitter()
Job.constructor = Job
Job.constructor.prototype = Job.prototype

function Job (cmd, argv, opts) {
  var instance = Object.create(Job.prototype)
  EventEmitter.call(instance)

  argv = argv || []
  opts = opts || {}

  oop(instance)
    .internal('cp', null)
    .internal('cmd', cmd)
    .internal('argv', Array.isArray(argv) ? argv : [argv])
    .internal('stdio', opts.stdio || 'inherit')
    .internal('stdin', opts.stdin || null)
    .internal('watch', opts.watch || [])
    // await means 'wait until exit to start watch'
    .flag('await', !!opts.await) // defaults to false

  if (opts.watch && !Array.isArray(opts.watch)) {
    opts.watch = [opts.watch] // opts.watch could be a string
  }

  // when this process exits or receives the following signals,
  // Job instance's child process should had already exited, or stop it

  process.on('beforeExit', (code) => {
    if (this._watcher) {
      log.error('%s is still watching before exit!', instance)
    }
    if (instance.cp === null) return
    log.error('%s is still running before exit %s!', instance, code)
    instance.stop()
  })
  process.on('exit', (code) => {
    if (instance.cp === null) return
    log.error('%s is still running on exit %s! killing...', instance, code)
    instance.cp.kill()
  })
  process.on('SIGINT', () => {
    if (instance.cp === null) return
    log.warn('%s should receive SIGINT through inherited stdin', instance)
    // TODO should only apply above to stdin is 'inherit' or 'pipe'?
    // log.warn('caught SIGINT, will stop %s...', instance)
    // instance.stop('SIGINT')
  })
  process.on('SIGUSR2', () => {
    if (instance.cp === null) return
    log.warn('caught SIGSUSR2, will stop %s ...', instance)
    instance.stop('SIGUSR2')
  })

  return instance
}

Job.prototype.toString = function () {
  return this.cp
    ? (basename(this.cmd) + '@' + this.cp.pid)
    : ('Job#' + basename(this.cmd))
}

function trunc (str, n, dots) {
  dots = dots || '...'
  return str.length > n ? str.substr(0, n - dots.length) + dots : str
}

Job.prototype.start = function start () {
  if (this.cp) return this.restart()

  var job = this

  log.warn('%s %s spawning now...', this, trunc(this.argv.join(' '), 16))
  log.verb('> %s %s', this.cmd, this.argv.join(' '))

  this.cp = spawn(this.cmd, this.argv, { stdio: this.stdio })
    .on('close', function (code, signal) {
      log[code || signal ? 'error' : 'info'](
        '%s closed with code %s and signal %s', job, code, signal
      ) // when code is 0 and there is no signal, this is just informational
      job.emit('close', code, signal)
    })
    .on('exit', function (code, signal) {
      log[code || signal ? 'error' : 'info'](
        '%s exited with code %s and signal %s', job, code, signal
      ) // when code is 0 and there is no signal, this is just informational
      job.cp = null
      if (job.watch.length) {
        // was awaiting exit to start watching?
        job.await && job.watcher('start')
      } else {
        log.warn('%s is done and will not run anymore.', job)
      }
      job.emit('exit', code, signal)
    })
    .on('error', function (err) {
      log.error('%s child process error', job, err.message)
      log.error(err.stack)
    })

  if (this.stdio === 'pipe') {
    // TODO pipe into log api?
    var writer = function (stream, foo) {
      var bol = true // begin of line
      var format = (msg) => iai.f('%s%s %s', job, foo, msg || '')
      return function (data) {
        data = data.toString('utf8')
        var lines = data.split('\n')
        // 1 line means no newline character found
        if (lines.length < 2) {
          stream.write(bol ? format(data) : data)
        } else {
          data = lines.map(
            (line, i) => (
              (i < 1 && !bol) || (i === lines.length - 1 && line === '')
            ) ? line
              : format(line)
          ).join('\n')
          stream.write(data)
        }
        // it's begin of line when last character is a newline char
        bol = data[data.length - 1] === '\n'
      }
    }
    log.info('> will display child process outputs on this process outputs')
    this.cp.stdout.on('data', writer(process.stdout, '|'))
    this.cp.stderr.on('data', writer(process.stderr, '#'))
    if (this.stdin) {
      var unpipe = (why) => log.info("%s's stdin %s, unpiped input", this, why)
      log.warn('> will pipe given stdin stream to child process stdin')
      var pid = this.cp.pid
      this.stdin
        .pipe(this.cp.stdin)
        .on('close', () => unpipe('has closed pid=' + pid))
        .on('error', (err) => {
          if (err.code === 'ECONNRESET') return unpipe('disconnected')
          log.error('%s stdin pipe error %s', this, err.stack)
          throw err
        })
    }
  }
  return (this.watch.length && !this.await) ? this.watcher() : this
}

Job.prototype.watcher = function watcher (action) {
  if (this._watcher) {
    return log.warn('> watcher still running for %s', this)
  }
  action = /start|restart|stop/.test(action) ? action : 'restart'
  log.warn('> starting watcher to %s %s on all events', action, this)

  var watcher = this._watcher = watch(this.watch, {
    persistent: true, ignoreInitial: true // chokidar options
  })
    .on('ready', () => {
      log.info('watching %s paths to %s %s...', this.watch.length, action, this)
      var signals = [ 'SIGINT', 'SIGUSR2' ]
      signals.forEach(signal => process.on(signal, () => {
        if (!watcher) return log.error('there is no watcher to stop')
        log.info('caught %s, stopping watcher for %s...', signal, this)
        watcher.close()
        watcher = this._watcher = null
      }))
      log.verb('> watcher will close on %s signals', signals.join(' or '))
      log.verb('> waiting an event to %s...', this.await ? 'run again' : action)
    })
    .on('close', () => log.error('closed watcher for %s', this))
    .on('all', (event, file) => {
      log.warn(
        'will %s %s (watched %s %s)',
        action, this, event, relative(process.cwd(), file)
      )
      this[action]()
    })
  return this
}

Job.prototype.unwatch = function unwatch () {
  if (this._watcher) {
    log.info('%s stoping watcher...', this)
    this._watcher.close()
  }
  return this
}

Job.prototype.restart = function restart () {
  if (!this.cp) {
    log.warn('%s is stoped but is going to start...', this)
    return this.start()
  }
  log.verb('stopping %s to restart...', this)
  return this.stop('SIGUSR2', () => {
    log.verb('> restarting %s...', this)
    this.start()
  })
}

Job.prototype.stop = function stop (signal, callback) {
  signal = signal || 'SIGUSR2'
  var signals = [signal, 'SIGTERM']

  function attempt () {
    var t = 2 + signals.length // seconds
    signal = signals.shift()
    log.info('stopping %s with %s (timeout in %ss)...', this, signal, t)
    var timeout = setTimeout(() => {
      log.error('%s did not handle %s after %ss', this, signal, t)
      timeout = null
      if (signals.length) {
        attempt.call(this)
      } else {
        throw new Error('could not kill it')
      }
    }, t * 1000)
    this.cp.once('exit', () => {
      if (timeout) {
        clearTimeout(timeout)
        log.verb('> %s handled %s after %sms', this, signal, Date.now() - init)
        typeof callback === 'function' && process.nextTick(callback)
        return
      }
      throw new Error('what the fuck happened here?')
    })
    var init = Date.now()
    this.cp.kill(signal)
  }
  attempt.call(this)
  // TODO if child process does not handle SIGUSR2 and exit? => timeout
  return this
}

/* vim: set expandtab: */
/* vim: set filetype=javascript ts=2 shiftwidth=2: */
