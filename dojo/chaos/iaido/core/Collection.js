var iai = require( 'iai' )
  , is = iai('is')
  , oop = iai( 'oop' )
  , Parent = iai( 'core/Resource' )
  , debug = require( 'debug' )( 'iai:core:collection' )
;

/**
 * iai resource I+D+i
 */


var exports = module.exports = oop.builder(function( id ){
  return oop( Parent.call( this, id ) )
    .visible( 'items', [] )
    .o
  ;
}, Parent.prototype, {
  //
  // Definition methods
  //
  item: function( resource ){
    if( ! (resource instanceof Parent) ){
      throw TypeError( 'Collection items must be instances of Resource' );
    }
    if( this.findById( resource.id ) ){
      throw TypeError( 'Resource ids within a collecion must be unique' )
    }
    this.items.push( resource );
    return this;
  },

  //
  // Resource
  //

  resolve: function( path ){
    var parts = path.split('/').filter(function(v){ return !!v; })
      , result = this
    ;
    while( parts.length ){
      result = result[ result.findById? 'findById':'resolve' ]( parts.shift() );
      if( !result ){
        break;
      }
    }
    return result;
  },

  //
  // data access methods
  //

  findById: function( id ){
    var result = null;
    this.items.some(function( item ){
      result = (item.id == id)? item : result;
      return result !== null;
    });
    return result;
  },

  // allways returns an Array
  find: function( filters ){
    if( !is.Literal(filters) ){
      throw TypeError('find filters must be a literal object');
    }

    return this.items.filter(function( item ){
      return Object.keys(filters).every(function( attr ){
        return item[attr] == filters[attr];
      })
    });
  },

  toString: function( ){
    return this.id? ("[Collection "+this.id+"]") : Parent.prototype.toString.call(this);
  },
  toObject: function( ){
    var o = Parent.prototype.toObject.call( this );
    o.items = this.items.map(function( item ){ return item.toObject(); });
    return o;
  }
});


exports.version = "0";
exports.stability = 1;
