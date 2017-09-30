var iai = require( 'iai' )
  , oop = iai( 'oop' )
  , fs = require( 'fs' )
  , path = require( 'path' )
  , basename = path.basename
  , extname = path.extname
  , resolve = path.resolve
  , debug = require( 'debug' )( 'iai:core:fs' )
  //, f = require( 'util' ).format
;

var exports = module.exports = fsFactory;

exports.version = "0";
exports.stability = 1;

/**
 * iai Fs I+D+i
 */

var Collection = iai('core/Collection');
var Item = iai('core/Item');

function fsFactory( path ){
  var stats = fs.statSync(path)
    , resource = require( path )
    , relative = iai.project.relative(path)
  ;

  if( resource instanceof iai('core/Resource') ){
    debug( 'IMPORT %s', relative );
    return resource;
  }

  var data = resource
    , id = basename( path, extname(path) )
  ;
  if( stats.isDirectory() ){
    debug( 'DIR %s', relative );
    resource = Collection( id );

    debug( 'READDIR %s', relative );
    var except = basename( require.resolve(path) )
    fs.readdirSync(path).forEach(function( filename ){
      if( filename == except ){
        return;
      }
      resource.item( fsFactory( resolve(path, filename) ) );
    });
  }
  else if( stats.isFile() ){
    debug( 'FILE %s', relative );
    resource = Item( id );
  }
  else {
    throw TypeError( "can't instance other things rather than directories or regular files")
  }

  Object.keys( data )
  .filter(function( attr ){ return /(name|desc)/.test(attr); })
  .forEach(function( attr ){ resource[attr]( data[attr] ); })
  ;
  Object.keys( data )
  .filter(function( attr ){ return ! /(name|desc)/.test(attr); })
  .forEach(function( attr ){
    resource[attr](  iai.project.resolve( data[ attr ] )  );
  });
  return resource;
}
