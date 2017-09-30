var iai = require( 'iai' )
  , oop = iai( 'oop' )
  , ValidationError = iai( 'data/ValidationError' )
;

module.exports = oop.builder(function(opts){
  var instance = Object.create(this);

  opts = opts || {};
  if( !!opts.msg ){
    instance.message = opts.msg;
  }
  if( opts.code ){
    instance.code = opts.code;
  }

  return oop( instance.validate.bind(instance) )
    .set('o', instance)
    .o
  ;
}, {
  message: "Introduza un valor válido.",
  code: "invalid",
  error: ValidationError,
  clean: function( value ){
    return value;
  },
  validate: function( value ){
    value = this.clean(value);
    throw this.error( this.message, this.code, { value: value } );
  }
});

module.exports.version = '1';
module.exports.stability = 2;
