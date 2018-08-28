//
// # Utilities to deal with common things of the node process
//

const f = require('util').format

const Log = require('./log')
const log = Log.constructor(__filename)

// log.level = log.VERB

/**
 * TODO: avoid usage of process.exit
 *
 * As stated on [this answer at SO](https://stackoverflow.com/a/40321400/1894803)
 * and at node's documentation:
 * > It is important to note that calling process.exit() will force the process
 * > to exit *as quickly as possible* even if there are still asynchronous
 * > operations not yet fully completed, **including I/O operations** to stdout
 * > and stderr. (...)
 * >
 * > It's recommended to set `process.exitCode` and let node exit by its means.
 * >
 * > # Posible reasons why usage of process.exit() should be avoided:
 * >
 * > ## Case 1: Execution complete (command line script)
 * >
 * > Example: If a script reaches its end and node doesn't exit, it's because
 * > *there are async operations still pending*. It's better to do a research
 * > of **what is holding the script from exiting in expected way**.
 * >
 * > See https://stackoverflow.com/a/26059880/1894803
 */
exports.debug = function debugActiveRequestsAndHandles () {
  var reqs = process._getActiveRequests()
  var hand = process._getActiveHandles()

  // TODO should format better this debug info
  log.warn('- ACTIVE REQUESTS AND HANDLES -')
  log.warn('------ %s ACTIVE REQUESTS ------', reqs.length)
  log.verb(reqs)
  log.warn('------ %s ACTIVE HANDLERS ------', hand.length)
  log.verb(hand)
  log.warn('To see complete info, Enable VERB log level at %s', __filename)
}
/*
 * >
 * > ## Case 2: Termination because of external signal (SIGINT/SIGTERM/etc)
 * >
 * > Example: An http/s server is running, and it should be closed before exit
 * > with `server.close()` so possible pending requests, specially those that
 * > **are non-idepotent (UPDATE, DELETE)**, can finish gracefully without
 * > **producing data inconsistencies between client and server.
 * >
 * > ## Case 3: Internal error
 * >
 * > It's always better to `throw` an error, and let the process crash with a
 * > *nicely formatted* stack trace. Code upfront should take care of handle
 * > (or not to handle) the error.
 */

/**
 * TODO this comment no longers apply
 * Ensure process emits 'exit' when got SIGINT or uncaughException.
 * Inspired by [an aswer at SO](http://stackoverflow.com/a/21947851/1894803)
 */
var sigintCount = 0
function interrupt () {
  if (!process.listeners('SIGINT').filter(fn => fn !== interrupt).length) {
    log.warn('received a SIGINT signal that will not be handled')
    if (++sigintCount < 2) return
    log.fatal(2, 'forcing process exit on second interrupt')
  }
  log.warn('Got SIGINT. Setting process.exitCode to 2.')
  process.exitCode = 2
  var req = process._getActiveRequests()
  var han = process._getActiveHandles()
  // warn when there are active requests or handles pending to complete
  if (req.length || han.length) {
    // TODO singular/plural
    log.info('there are %s pending on SIGINT',
      f('%s', req.length ? req.length + ' requests' : '') +
      f('%s', req.length && han.length ? ' and ' : '') +
      f('%s', han.length ? han.length + ' handles' : '')
    )
    // display active requests and handles
    exports.debug()
    if (++sigintCount < 2) return
    log.error('this is the %s time SIGINT handler runs', sigintCount)
    if (++sigintCount < 5) return
    log.fatal(2, 'forcing process exit on 5th interrupt', sigintCount)
  }
}
process.on('SIGINT', interrupt)
exports.ignoreSIGINT = function () {
  process.removeListener('SIGINT', interrupt)
}

process.on('uncaughtException', function uncaught (err) {
  log.fatal(99, 'Got uncaught exception: %s', err.stack)
})

/**
 * SIGUSR2 is the signal used by iai Jobs to exit gracefully
 * set a handle to warn when this signal is forbidden
 */

process.on('SIGUSR2', function restart () {
  if (!process.listeners('SIGUSR2').filter(fn => fn !== restart).length) {
    log.error('received a SIGUSR2 signal that will not be handled')
  } else {
    log.info('Got SIGUSR2. Setting process.exitCode to 0.')
    process.exitCode = 0
  }
})

/**
 * Ignore EPIPE errors when appropiate.
 * Based on [epipebomb](https://github.com/mhart/epipebomb).
 * As documented at that module:
 *
 * > By default, node throws EPIPE errors if process.stdout is being written to
 * > and a user runs it through a pipe that gets closed while the process is
 * > still outputting (eg, the simple case of piping a node app through head).
 *
 * There is no problem ignoring that error because process should had already
 * finished when output streams finished, both
 * [stdout](https://nodejs.org/api/process.html#process_process_stdout) and
 * [stderr](https://nodejs.org/api/process.html#process_process_stderr).
 */
/*
function epipebomb (err) {
  if (err.code === 'EPIPE') process.exit()
  // throw errors when they should be thrown
  if (this.listeners('error').length <= 1) throw err
}
process.stdout.on( 'error', epipebomb );
process.stderr.on( 'error', epipebomb );
*/

// this should not be forced to be displayed, it's just informational
log.info('process bindings were defined')

/* vim: set expandtab: */
/* vim: set filetype=javascript ts=2 shiftwidth=2: */
