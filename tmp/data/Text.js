var iai = require('iai')
  , oop = iai('oop')
  , is = iai('is')
  , Parent = iai('data/Field')
  , ValidationError = iai('data/ValidationError')
;

/**
 * @builder TextField
 */

module.exports = oop.builder(function(opts){
  opts = opts || {};

  return oop( Parent.call(this, opts) )
    .internal('_type', 'TextField')
    .visible('max_length', is.Number(opts.max_length)? +opts.max_length : false)
    .visible('min_length', is.Number(opts.min_length)? +opts.min_length : false)
    .o
  ;
}, Parent.prototype, {
  error: {
    str: ValidationError.bind( null,
      "Este campo debe conter unha cadea de texto.", "string"
    ),
    max: ValidationError.bind( null,
      "A lonxitude máxima deste campo é de %(max)s (agora é %(len)s).", "too_long"
    ),
    min: ValidationError.bind( null,
      "A lonxitude mínima deste campo é de %(min)s (agora é %(len)s).", "too_tiny"
    )
  },
  validate: function( data, callback ){
    // DRY
    var fail = function( error ){
      process.nextTick( callback.bind(null, error, null) );
      return this;
    }.bind(this);

    if( !is.String(data) ){
      return fail( this.error.str() );
    }
    if( this.max_length !== false && data.length > this.max_length ){
      return fail( this.error.max({ val: data, max: this.max_length }) );
    }
    if( this.min_length !== false && data.length < this.min_length ){
      return fail( this.error.min({ val: data, min: this.min_length }) );
    }

    return Parent.prototype.validate.apply(this, arguments);
  }
});

module.exports.version = "1";
module.exports.stability = 2;
