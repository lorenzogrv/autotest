var oop = require( 'iai-oop' )
  , iai = require( 'iai' )
  /*, is = require( 'iai-is' )
  , fs = require( 'fs' )
  , npath = require( 'path' )
  , resolve = npath.resolve
  , dirname = npath.dirname
  , https = require( 'https' )
  , Parent = require( './Component' )*/
;

iai.conf
  .register( 'domain', 'localhost', iai.conf.types.str )
  .register( 'port', 8080, iai.conf.types.int )
  .register( 'layout', iai('core/Layout'), iai.conf.types.fn )
;

// stores all applications
var index = {};

var exports = module.exports = oop.builder(function(name){
  return oop.create( this )
    .visible( 'name', name )
    .visible( 'subdomains', {} )
    .o
  ;
}, {
  toString: function(){
    return "[" + this.name + " Application]";
  },
  subdomain: function( slug, app ){
    this.subdomains[ slug ] = app;
    return this;
  },
  // handles a net request
  request: function( req, res ){
    var re = RegExp( iai.conf.domain+'$' )
      , host = req.headers.host.split(':')[0]
    ;

    if( ! re.test(host) ){
      res.statusCode = 401;
      return iai.conf.layout( res ).render( 'bad host name' );
    }

    console.log(
    req.headers.host.split(':')[0]
      .replace( host, '' )
    );
    res.end('ok')
  }
});

exports.version = "1";
exports.stability = 1;
