//
// # Utilities to deal with common things of the node process
//

var log = require('./log').constructor(__filename);

/**
 * Ensure process emits 'exit' when got SIGINT or uncaughException.
 * Inspired by [an aswer at SO](http://stackoverflow.com/a/21947851/1894803)
 */
process.on('SIGINT', function interrupt( ){
  log.verb( 'Got SIGINT. Will exit with code 2.' );
  log.warn( 'User interrupt.' );
  process.exit(2);
});

process.on('uncaughtException', function uncaught( err ){
  log.verb( 'Got uncaught exception - exit 99' ).verb( err.stack );
  log.fatal( 99, err.stack );
});

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
//process.stdout.on( 'error', epipebomb );process.stderr.on( 'error', epipebomb );
function epipebomb( err ){
  if( err.code === 'EPIPE' ) process.exit();
  // throw errors when they should be thrown
  if( this.listeners('error').length <= 1 ) throw err;
}


