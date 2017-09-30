var oop = require( 'iai-oop' )
  , is = require( 'iai-is' )
  , fs = require( 'fs' )
  , npath = require( 'path' )
  , resolve = npath.resolve
  , dirname = npath.dirname
  , https = require( 'https' )
  , Parent = require( './Component' )
;

var exports = module.exports = oop.builder(function(module){
  var instance = Parent.call(this, module);
  var certs = {
    key: fs.readFileSync( instance.resolve('key.pem') ),
    cert: fs.readFileSync( instance.resolve('cert.pem') )
  }
  var server = https.createServer(certs)
    .on( 'request', instance.emit.bind(instance, 'request') )
  ;
  var listening = false;
  return oop(instance)
    .accessor( 'listening', function(){ return listening; } )
    .visible( 'listen', function( port, callback ){
      server.listen( port, (function(){
        console.log( this+" running https server on port "+port )
        listening = true;
        callback? callback() : null;
      }).bind(this) );
      return this;
    })
    .visible( 'close', function( callback ){
      server.close( (function(){
        console.log( this+" stopped https server" )
        listening = false;
        callback();
      }).bind(this) );
      return this;
    })
    .o
  ;
}, Parent.prototype, {
  toString: function(){
    return "[object Application]";
  }
});
exports.version = "0";
exports.stability = 1;
