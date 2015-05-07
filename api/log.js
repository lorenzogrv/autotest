var oop = require('iai-oop');
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
    .hidden( 'filename', from )
    .set( 'stdout', process.stdout )
    .set( 'stderr', process.stderr )
    .o
  ;

  return Log.cache[from] = instance;
}

// cache object
oop( Log ).hidden( 'cache', {} );

// prepares a message as string
Log.msg = function(){};

// output functions (mostly for internal use)
Log.out = function(){};
Log.err = function(){};

// Log-level accesors
Log.fatal = function(){};
Log.error = function(){};
Log.warn = function(){};
Log.info = function(){};
Log.verb = function(){};

