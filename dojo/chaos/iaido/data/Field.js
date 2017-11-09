var iai = require('iai')
  , oop = iai('oop')
  , is = iai('is')
  , Parent = iai('data/Data')
  , ValidationError = iai('data/ValidationError')
;

/**
 * @builder Field: The leaf for Schema-Field composite pair.
 * @pattern Composite
 */

var Field = oop.builder(function Field(opts){
  opts = opts || {};
  return oop( Parent.call(this) )
    .internal( '_type', 'Field' )
    .visible( 'blank', !!opts.blank )
    .visible( 'unique', !!opts.unique )
    .o
  ;
}, Parent.prototype, {
  error: ValidationError.bind( null, "Este campo debe conter un valor.", "empty" ),
  validate: function( data, callback ){
    if( "function" !== typeof callback ){
      throw new TypeError("callback should be a function");
    }
    callback = callback.bind.bind( callback, null );

    if( !this.blank && is.Empty(data) ){
      process.nextTick( callback( Field.prototype.error(), null ) )
    } else {
      process.nextTick( callback(null, data) );
    }

    return this;
  }
})

var exports = module.exports = Field;

exports.version = "0";
exports.stability = 1;

