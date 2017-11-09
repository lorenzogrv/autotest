/**
 *   content api is based on the composite pattern.
 *   The generator function recursively walks `path` to populate
 *   an instance of Directory composite, based on the iai.Plugin api.
 *   iai Plugin is the base component for leaf (File) and composite (Directory)
 */

var exports = module.exports = root;

exports.version = '1'
exports.stability = 1;



function root( callback ) { // TODO rename generator to "root", and module to fs
  console.log( 'going to mount root on ', this.resolve( './' ) );
  Directory.create( this.resolve( './' ), callback );
}

var iai = require( '../..' )
  , oop = iai( 'oop' )
  , isAbsolute = iai( 'is' ).isAbsolute
  , resolve = require( 'path' ).resolve
  , createPlugin = iai( 'plugin' )
;

/**
 * @prototype FsItem: Represents a resource on the filesystem
 * @inherits from IaiPlugin
 * @pattern: this is the component for directory composite and file leaf
 */

var FsItem = createPlugin({
  create: function( root ){
    if( !isAbsolute(root) ){
      throw TypeError( this+"#create: root must be an absolute path" );
    }
    return oop.create( this )
      //.heap()
      .visible( 'resolve', function( path ){
        return resolve( root, path )
      })
      .o
    ;
  },
  path: function(){
    return this.resolve( '.' );
  }
});

/**
 * @prototype Directory: Represents a directory on the filesystem.
 * @inherits from FsItem
 * @pattern: this is the composite for FsItem
 *
 */

var Directory = oop.extend( FsItem, {
  create: function( root, callback ){
    try {
      var dir = FsItem.create.call( this, root );
      callback( null, dir );
    }
    catch(e){
      callback(e);
    }
    return null;
  }
});


/**
 * @prototype File: Represents a file on the filesystem.
 * @inherits from FsItem
 * @pattern: this is the leaf for FsItem
 *
 */
//var File = oop.factory( function File(){}, FsItem.prototype );
