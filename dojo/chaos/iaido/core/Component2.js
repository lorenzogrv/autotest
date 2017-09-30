var is = require( 'iai-is' )
  , oop = require( 'iai-oop' )
  , iai = require( '../..' )
  , path = require( 'path' )
  , resolve = path.resolve
  , dirname = path.dirname
  , relative = path.relative
  , debug = require( 'debug' )( 'iai:core:component2' )
  , format = require( 'util' ).format
;

/**
 * @builder Component: Represents an application component
 *   @param abspath (String): the absolute path of the directory where
 *                            the component's source code lives.
 *
 * if extra parameters are given, abspath will be resolved applying the
 * entire argument list to node's built-in path.resolve
 *
 */

var exports = module.exports = oop.builder(function( dotpath ){

  /*if( ! is.AbsolutePath(abspath) ){
    throw TypeError( "Application components must reference an absolute path" )
  }*/
  console.log( "using component2 to do, actually, nothing" );

  return oop.create(this).o;

  if( ! exports.components[abspath] ){
    var component = oop( Parent.call(this) )
      .visible( 'resolve', resolve.bind(null, abspath) )
      .o
    ;

    if( !exports.main ){
      exports.main = component;
    }

    debug( 'component created %s', component );

    exports.components[ abspath ] = component;
  }

  return exports.components[ abspath ];
}, {
  /*toString: function( ){
    return format( '[Component /%s]', relative(process.cwd(), this.resolve()) );
  },
  require: function( path ){
    return require( this.resolve.apply(null, arguments) );
  }*/
});

// stores the component index per process
exports.components = {};
// stores the first component called
exports.main = null;

exports.version = "0";
exports.stability = 1;
