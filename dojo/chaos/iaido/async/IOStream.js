var stream = require('stream')
  , PassThrough = stream.PassThrough
  , Readable = stream.Readable
//  , inherits = require('util').inherits
;

module.exports = IOStream;
module.exports.version = '0.1';
module.exports.stability = 1;


//inherits( IOStream, Duplex );
IOStream.prototype = Object.create( PassThrough.prototype );

function IOStream( options ){
  var instance = Object.create( IOStream.prototype );

  PassThrough.call( instance, options );
  // resume the readable interface by default
  // lets user decide wherever to "end" the output
  //instance.resume();
  return instance;
}


IOStream.prototype.input = function( chunk ){
  if( chunk === null ){
    this.end();
  } else if( chunk instanceof Readable ){
    chunk.pipe( this );
  }
  return this;
};

/**
 * # Sending data through the readable interface
 *
 * `io.push( '...' )` should (internally) make the IOStream to send data
 *
 * `io.output( '...' )` should make the IOStream to send data
 * `io.output( null )` should make the IOStream to end outputing data
 */

