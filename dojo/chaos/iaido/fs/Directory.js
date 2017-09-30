var is = require( 'iai-is' )
  , oop = require( 'iai-oop' )
  , iai = require( '../..' )
  , fs = require( 'fs' )
  , path = require( 'path' )
  , debug = require( 'debug' )( 'iai:fs:directory' )
  , format = require( 'util' ).format
;

/**
 * @builder Directory: Represents a directory on the filesystem
 *   @param abspath (String): the absolute path of the directory.
 *
 */

// stores the directories
var directories = {};

var Parent = iai( 'async/Notifier' );
var exports = module.exports = oop.builder(function( abspath ){
  if( ! is.AbsolutePath(abspath) ){
    throw TypeError( "Directories must reference an absolute path" )
  }

  if( ! directories[ abspath  ] ){
    var dir = oop( Parent.call(this) )
      .visible( 'resolve', path.resolve.bind(null, abspath) )
      .visible( 'relative', path.relative.bind(null, abspath) )
      .visible( 'basename', path.basename.bind(null, abspath) )
      .o
    ;

    debug( 'directory object created %s', dir );
    directories[ abspath ] = dir;
  }

  return directories[ abspath ];
}, Parent.prototype, {
  toString: function( ){
    return format( '[Directory %s]', iai.project.relative( this.resolve() ) );
  },
  require: function( path ){
    return require( this.resolve.apply(null, arguments) );
  },
  // calls callback once for each file inside this directory
  // dir is optional
  // recursive
  find: function( dir, complete ){
    complete = arguments[ arguments.length-1 ];
    dir = ( arguments.length > 1 )? dir : '';

    if( typeof complete !== 'function' ){
      throw TypeError( 'Complete callback is needed' );
    }

    var jobs = 0
      , files = []
      , errors = []
    ;

    fs.readdir( this.resolve( dir ), read.bind(this) );

    function read( err, list ){
      if( err ){
        return callback( err );
      }
      while( list.length ){
        jobs++;
        file = this.resolve( dir, list.shift() )
        fs.stat( file, stat.bind(this, file) );
      }
    }

    function stat( file, err, stats ){
      file = this.relative( file );

      if( err ){
        return callback( err, file, stats );
      }

      if( stats.isDirectory() ){
        jobs++;
        this.find( file, callback );
      }

      callback( null, file, stats );
    }

    function callback( err, file, stats ){
      if( err && err instanceof Error ){
        throw err;
      } else if( err ){
        return debug( "non-error received as error: ", err );
      }

      if( Array.isArray(file) ){
        // store a result from a inner this#find
        files = files.concat( file );
      } else {
        // store the file and/or stats
        // here is where a custom filter makes sense
        // maybe something like
        //     file = filter( file, stats )
        //     if( file ) files.push( file );
        // this way user is available to filter stat-based
        files.push( file );
      }

      if( !--jobs ){
        return complete( null, files.sort() );
      }
    };

  },
  // syncronous version of Directory#find
  // TODO not implemented
  findSync: function( dir ){
    dir = dir? dir : '';

    throw Error('This will not work yet');

    var output = fs.readdirSync( this.resolve( dir ) )
      .map(function( file ){
        file = this.resolve( dir, file );
        var stats = fs.statSync( file );
        if( stats.isDirectory() ){
          file = [ file ].concat( this.findSync(file) )
        }
        return file;
      }, this)
      .map(function( file ){
        //return Array.isArray(file)?
      })
    ;
  }
});

exports.version = "0";
exports.stability = 1;
