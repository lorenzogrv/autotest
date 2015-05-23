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
    .internal( 'stdout', process.stdout ) // TODO option to redirect stdout
    .internal( 'stderr', process.stderr ) // TODO option to redirect stderr
    .o
  ;

  Log.info('created log from', from);
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
  msg +=(( color? ansi.reset : '' ));
  msg +=(( this + ' ' ));
  msg +=(( color? ansi[color] : '' ));
  msg +=(( options.prepend || '' ));
  msg +=(( format.apply(0, report).split('\n').join( '\n' + msg ) ));
  msg +=(( color? ansi.reset : '' ));

  options.stream.write( msg + '\n' );
  return this;
};

// output functions (mostly for internal use)
Log.out = function( report, opts ){
  opts.stream = this.stdout; return this.msg( report, opts );
};
Log.err = function( report, opts ){
  opts.stream = this.stderr; return this.msg( report, opts );
};

//
// Log-level accesors
//
Log.fatal = function( ){
  this.error('FATAL ERROR!').error.apply( this, arguments );
  process.exit(1);
};
Log.error = function( ){
  return this.err( arguments, { color: 'red', prepend: 'ERROR: ' });
};
Log.warn = function( ){
  return this.err( arguments, { color: 'yellow', prepend: 'WARN: ' });
};
Log.info = function( ){
  return this.out( arguments, { color: 'blue', prepend: 'INFO: ' });
};
Log.verb = function( ){
  return this.out( arguments, { color: 'gray' });
};

