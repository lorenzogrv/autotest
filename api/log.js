var relative = require('path').relative;
var format = require('util').format;

var oop = require('iai-oop');
var ansi = require('iai-ansi');
var callsite = require('./callsite');

// EXPOSED OBJECT
var exports = module.exports = Log.bind( Log );

exports.prototype = Log;
exports.prototype.constructor = Log;

/**
 * @function Log: returns a log api bound to the file where it was created
 * @param from: provide a function to research a previous CallSite
 * @returns Log object
 */
function Log( from ){
  from = from || Log;
  from = callsite( from ).getFileName();

  if( Log.cache[from] ){
    return Log.cache[from];
  }

  var instance = oop.create( this )
    .visible( 'filename', from )
    .flag( 'mute', false )
    .flag( 'clean', false )
    .internal( 'stdout', process.stdout ) // TODO option to redirect stdout
    .internal( 'stderr', process.stderr ) // TODO option to redirect stderr
    .o
  ;

  // TODO log "depth" to disable, i.e., this message
  // Log.info('created log from', from);
  return Log.cache[from] = instance;
}

oop( Log )
// cache object
.hidden( 'cache', {} )
// default output streams
.internal( 'stdout', process.stdout )
.internal( 'stderr', process.stderr )
;

Log.toString = function( ){
  return '['
    + relative( process.cwd(), this.filename || __filename )
    + '@' + process.pid
    +']'
  ;
}

// outputs a report as string
Log.msg = function( report, options ){
  var color = options.color;

  var msg = '';
  msg +=((  color? ansi.reset : ''  ));
  msg +=((  this.clean? '' : (this+' ')  ));
  msg +=((  color? ansi[color] : ''  ));
  // todo think if another option for "not prepending"
  msg +=((  this.clean? '' : (options.prepend||'')  ));
  msg +=((  format.apply(0, report).split('\n').join( '\n' + msg )  ));
  msg +=((  color? ansi.reset : ''  ));

  options.stream.write( msg + '\n' );
  return this;
};

// output functions (mostly for internal use)
Log.out = function( report, opts ){
  if( this.mute ) return this;
  opts.stream = this.stdout; return this.msg( report, opts );
};
Log.err = function( report, opts ){
  opts.stream = this.stderr; return this.msg( report, opts );
};

//
// Log-level accesors
//
Log.fatal = function( code ){
  var hasCode = ( 'number' === typeof code );
  this.error('FATAL ERROR%s!', hasCode? (' with exit code '+code||1) : '' );
  this.error.apply( this, hasCode? [].slice.call(arguments, 1) : arguments );
  process.exit( hasCode? code : 1 );
};
Log.error = function( ){
  return this.err( arguments, { color: 'red', prepend: 'ERROR: ' });
};
Log.warn = function( ){
  return this.err( arguments, { color: 'yellow', prepend: 'WARN: ' });
};
Log.info = function( ){
  return this.out( arguments, { color: 'blue', prepend: '' });
};
Log.verb = Log.verbose = Log.debug = function( ){
  return this.out( arguments, { color: '', prepend: 'DEBUG: ' });
};

