var iai = require( 'iai' )
  , oop = iai( 'oop' )
  , fs = require( 'fs' )
  , path = require( 'path' )
  , debug = require( 'debug' )( 'iai:core:resource' )
  , f = require( 'util' ).format
;

/**
 * iai resource I+D+i
 */

var exports = module.exports = oop.builder(function( id ){
  debug( 'create resource with id %s', id );
  return oop.create( this )
    .visible( 'id', id )
    .internal( '_layout', null )
    .internal( '_styles', null )
    .o
  ;
}, {
  //
  // Definition methods
  //

  // sets resource name
  name: function( name ){
    this.name = String(name);
    debug( '%s: set title="%s"', this, this.name );
    return this;
  },
  // sets resource description
  desc: function( desc ){
    this.desc = String(desc);
    debug( '%s: set desc="%s"', this, this.desc );
    return this;
  },
  // sets resource layout file, resolves relative to project's root
  layout: function( file ){
    debug( '%s: set layout="%s"', this, file );

    this.layout = file;

    return this;
  },
  // tells whatever this resource has a layout file set
  hasLayout: function( ){
    return typeof this.layout !== 'function';
  },
  // sets resource styles file
  styles: function( file ){
    debug( '%s: set styles="%s"', this, file );

    this.styles = file;

    return this;
  },
  // tells whatever this resource has a styles file set
  hasStyles: function( ){
    return typeof this.styles !== 'function';
  },

  resolve: function( path ){
    // Only collection-like resources can resolve paths to other resources.
    // Any resource can resolve to itself, given empty path or '/'
    return (!path || path == '/')? this : null;
  },

  render: function( ){
    return f(
      '<h1>%s (%s)</h1><p>%s</p><pre>%s</pre>',
      this.name || "no name", this.id,
      this.desc || "no description",
      JSON.stringify( this.toObject(), null, 4 )
    );
  },

  //
  // Converter methods
  //
  toString: function( ){
    if( this.id ){
      return f( "[Resource %s]", this.id );
    } else {
      return Parent.prototype.toString.call(this);
    }
  },
  toObject: function( ){
    var o = Object.create(null);
    Object.keys(this)
      .filter( function( v ){ return 'function' != this[v]; }, this )
      .forEach( function( v ){ o[v] = this[v]; }, this )
    ;
    return o;
  }
});

exports.version = "0";
exports.stability = 1;
