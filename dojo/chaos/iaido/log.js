var assert = require( 'assert' )
  , format = require( 'util' ).format
  , trace = require( 'stack-trace' )
  , is = require( 'iai-is' )
  , iai = require( './iai' )
;

/*!
 * Expose logger function, version string and stability flag.
 */

var exports = module.exports = logger;

exports.version = '1';
exports.stability = 1;

function logger( label, level ){
  assert( label, 'loggers must have label' );
  level = level || logger.INFO;

  return function log( message, param1, paramN ){
    if( level > iai.conf.LOG_LEVEL ){
      return;
    }

    message = format.apply( null, [].slice.call(arguments) );
    console.log( "%s %s: %s (+%dms)",
                 style.pid + process.pid + style.reset,
                 style.label + label.toUpperCase() + style.reset,
                 style.message + message + style.reset,
                 (Date.now() - logger.start)
    );

    if( iai.conf.LOG_LEVEL >= logger.VERBOSE ){
      var stack = trace.get()
        , indent = new Array( process.pid.toString().length+1 ).join(' ');
      ;
      // remove this file from the stack
      stack.shift();
      while( stack.length && is.AbsolutePath(stack[0].getFileName()) ){
        console.log( '%s %s', indent, formatCallSite(stack.shift()) );
      }
    }
  }
}

/**
 * Available log levels
 */

logger.INFO = 1;
logger.VERBOSE = 9;

// util to provide better debug info on VERBOSE mode
function formatCallSite( e ){
  return format( "%s:%d:%d",
                 e.getFileName(), e.getLineNumber(), e.getColumnNumber()
               );
}

/**
 * Styles for terminal output
 */

var ansi = iai( 'utils/ansi' );
var style = {
  pid: ansi.cyan,
  label: ansi.blue,
  message: ansi.white,
  reset: ansi.reset
};
// do not output styles if stdout is not a TTY
if( ! process.stdout.isTTY ){
  Object.keys( style ).forEach(function( key ){ style[ key ] = ""; });
}

// remember start time
logger.start = Date.now();
console.log( "%s %slog loaded @ %s%s",
             style.pid + process.pid + style.reset,
             style.message, (new Date()).toUTCString(), style.reset
           );
