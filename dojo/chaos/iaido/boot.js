var iai = require('./iai')
  , log = iai.logger( 'BOOTSTRAP' )
  , spawn = require('child_process').spawn
  , fs = require('fs')
  , watch = require('chokidar').watch
  , chmod = fs.chmod
;

/*!
 * Expose boot function, version string and stability flag.
 */

var exports = module.exports = boot;

exports.version = '1';
exports.stability = 1;

/**
 * register conf
 */

/**
 * @function boot: execute the main file of the commmonjs
 * module stored on the current working directory.
 */

var child;
var lastCode = null;

function boot(){

  if( child ){
    log( 'Killing child process to reboot...' );
    return child.kill( 'SIGUSR2' );
  }

  try {
    var bootstrap = require.resolve( process.cwd() );
  } catch( err ){
    if( err.code == 'MODULE_NOT_FOUND' ){
      console.error( '' );
      console.error( 'Fatal error: The current working directory is not a commonjs module' );
      console.error( '' );
      process.exit( 1 );
    }
    throw err;
  }

  log( 'Spawning child process (%s)', bootstrap );
  child = spawn( 'node', [bootstrap], { stdio: 'inherit' } );

  // care to kill child always if main process exits ?
  // exit non é o que estou buscando pa evitar un `killall node`
  /*process.on( 'exit', function( code ){
    console.log( 'Main process is about to exit with code %s!', code );
    console.log( 'I Should kill child now?' );
  });*/

  child.on( 'exit', function( code, signal ){
    log( 'child exited with code %s and signal %s', code, signal );
    child = null
    if( signal == 'SIGUSR2' ){
      return boot();
    }

    return log( 'waiting for a change to reboot...' );

    if( lastCode !== null && code == lastCode ){
      log( 'lastCode is %s, will not reboot.', lastCode );
      return;
    }

    lastCode = code;
    log( 'lastCode is now %s, rebooting in 3 seconds', code );
    setTimeout( boot, 3000 );
  });

  child.on( 'error', function( err ){
    log( 'Child process error', err.message );
    console.error( 'child process error', err.message );

    /**
     * Checks if the script file is executable
     * Uses bitmasks to determine whatever it is executable
     * Uses bitmasks to change permisions to make it executable
     * See also:
     *   http://www.perlmonks.org/bare/?node_id=323977
     *   http://man7.org/linux/man-pages/man2/chmod.2.html
     */
    if( err && err.code == "EACCES" ){
      log( 'Bootstrap file is not executable, making it executable' )
      var stats = fs.statSync( bootstrap );
      chmod( bootstrap, stats.mode | 00400 | 00200 | 00100, function( err ){
        if( err ){
          return log( 'error when making the file executable', err );
        }
        boot();
      });
      return;
    }

    console.error( err.stack );
  });

  log( 'watching for changes on %s', process.cwd() );
  watch( process.cwd(), {
    persistent: true,
    ignoreInitial: true
  })
    .on( 'all', function watcher( event, file ){
      this.close();
      log( 'watched a %s on %s', event, file );
      boot();
    })
  ;
}
