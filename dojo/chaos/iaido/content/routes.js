var iai = require( 'iai' )
  , oop = iai( 'oop' )
  , fs = require( 'fs' )
  , path = require( 'path' )
  , basename = path.basename
  , extname = path.extname
  , resolve = path.resolve
  , debug = require( 'debug' )( 'iai:content:routes' )
  //, f = require( 'util' ).format
;

var exports = module.exports = routes;

exports.version = "0";
exports.stability = 1;

/**
 * iai Fs I+D+i
 */

var Collection = iai('content/Collection');
var Item = iai('content/Item');

function routes( path ){
  var routes = Collection( '/' );

  iai( 'fs/Directory')(path).find(function( file ){
    //routes.add( factory( resolve(path, filename) ) );
    console.log( 'routes readed', arguments )
  });

  return routes;
}


function factory( path ){
}
