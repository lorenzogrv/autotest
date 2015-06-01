var PassThrough = require('stream').PassThrough;
var StringDecoder = require('string_decoder').StringDecoder;

var log = require('./log')();
/**
 * reads characters from any readable stream
 * if !n, it will read until \n (or opts.splitter) is found (and strip it)
 */

module.exports = read;

function read( stream, opts, callback ){
  opts = opts || {};
  opts.t = opts.t || 100;
  if( !opts.n ) opts.splitter = opts.splitter || '\n';
  log.info( 'READ STREAM', opts );

  stream = stream || process.stdin;
  stream.on( 'readable', _read );
  //stream.setRawMode && stream.setRawMode(true);
  
  // TODO do not force encoding if none given (so reading n-bytes)¿?
  var decoder = new StringDecoder('utf8');
  var result = '';
  var output = new PassThrough();
  callback && output.once('readable', function(){
    // read-once logic
    stream.removeListener('readable', _read);
    this.setEncoding('utf8');
    callback( null, this.read() );
  });
  var to = setTimeout(function(){
    stream.removeListener('readable', _read);
    log.warn( 'READ TIMEOUT', opts );
    output.emit( 'error', new Error('READ TIMEOUT') );
  }, opts.t);
  return output;

  function _read(){
    var chunk;
    while(  null  !==  (chunk = stream.read(opts.n))  ){
      // TODO do not force encoding if none given (so reading n-bytes)¿?
      var str = decoder.write(chunk);
      // TODO ^C¿? if( indexOf === '\u0003' ){ return process.exit(1) }
      var remain = false;
      if( opts.n && opts.n >= (result.length + str.length) ){
        // read -n strategy: read by length
        var slice = str.slice( 0, opts.n - result.length );
        result += slice;
        remain = str.slice( slice.length );
      } else if(  !!~str.indexOf(opts.splitter)  ){
        // read "line" strategy: read until splitter is found
        var split = str.split( opts.splitter );
        result += split.shift( );
        remain = split.join( opts.splitter );
      }
      if( remain === false ){
        result += str;
        continue;
      }
      // unshift if we get too much
      if( remain.length ){
        log.verb('remain', remain);
        stream.unshift( new Buffer(remain, 'utf8') );
      }
      // this can be commented but it avoids uneccesary calls
      // TODO decide if empty result pushes as splitter
      if( !result ){ continue; }
      // finish
      log.debug( 'READ', opts, JSON.stringify(result) );
      output.push( result );
      clearTimeout(to);
      result = '';
    }
  }
  
}
