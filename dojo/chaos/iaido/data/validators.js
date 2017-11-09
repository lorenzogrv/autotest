/**
 * Strongly inspired by [django's core validators](https://github.com/django/django/blob/master/django/core/validators.py)
 */

var iai = require( '../..' )
  , oop = iai( 'oop' )
  , is = iai( 'is' )
  , isRegExp = is( 'RegExp' )
;

var exports = module.exports = require('./ValidationError');

exports.version = '1';
exports.stability = 2;

var ValidationError = exports;

/**
 * @builder BaseValidator
 *
 */

var BaseValidator = require('./Validator')

var EMPTY_VALUES = [ null, undefined, '' ];

exports.empty = function( value ){
  if( Array.isArray(value) ){
    return !value.length;
  }
  if( is.Literal(value) ){
    return !Object.getOwnPropertyNames(value).length;
  }
  return !!~EMPTY_VALUES.indexOf(value);
};


exports.NotEmpty = BaseValidator();

/**
 * @builder RegExpValidator
 *
 * a validator that validates any value through a regular expresion
 */

var RegExpValidator = oop.builder(function(opts){
  var validator = BaseValidator.call(this, opts)
    , instance = validator.o
  ;
  opts = opts || {};
  if( isRegExp(opts.re) ){
    instance.re = opts.re;
  }
  return validator;
}, BaseValidator.prototype, {
  re: /.^/, // this regexp never will match
  message: "Introduza un valor válido.",
  code: "invalid",
  clean: function( value ){
    return "string" == typeof value? value : (
      isNaN(value)
      || !isFinite(value)
      || value === null
      || value === undefined
    )? "" : value.toString();
  },
  validate: function( value ){
    value = this.clean(value);
    if( !this.re.test(value) ){
      throw ValidationError( this.message, this.code );
    }
    return value;
  }
})

exports.RegExp = RegExpValidator;

/**
 * @builder EmailValidator
 *
 * @builder EmailValidator: A validator that validates given values to be email addresses.
 * Based on (isemail)[https://github.com/globesherpa/node-isemail], a js
 * port for the PHP function (is_email)[http://isemail.info/] (svn)[http://code.google.com/p/isemail/]
 * by [Dominic Sayers](http://dominicsayers.com/).
 */

var isEmail = require('isemail')

var EmailValidator = oop.builder(function(opts){
  var validator = BaseValidator.call(this, opts)
    , instance = validator.o
  ;
  opts = opts || {};
  if( is.Literal(opts.isemail) ){
    instance.isemail = opts.isemail;
  }
  return validator;
}, BaseValidator.prototype, {
  message: "Introduza un enderezo electrónico válido.",
  code: "invalid_email",
  isemail: {},
  clean: RegExpValidator.prototype.clean,
  validate: function( value, callback ){
    value = this.clean(value);

    if( !value || !isEmail(value, this.isemail, callback) ){
      throw ValidationError( this.message, this.code );
    }

    return value;
  }
});

exports.Email = EmailValidator;
exports.email = EmailValidator();

/**
 * Other handy RegExp validators:
 *   - CamelCase
 *   - camelCase
 *   - slug
 *
 */

exports.CamelCase = RegExpValidator({
  re: /^([A-Z][a-z]+)+$/,
  msg: "Introduza unha cadea de caracteres en formato 'CamelCase'."
})

exports.camelCase = RegExpValidator({
  re: /^[a-z]+([A-Z][a-z]+)*$/,
  msg: "Introduza unha cadea de caracteres en formato 'camelCase'."
})

exports.slug = RegExpValidator({
  re: /^[-a-zA-Z0-9_]+$/,
  msg: "Introduza un 'slug' válido formado por letras, números, guións ou guións baixos."
})

/**
 * @builder NumericValidator
 *
 * A validator that validates given values are valid numbers within optional limits
 *
 */

var NumberValidator = oop.builder(function(opts){
  var validator = BaseValidator.call(this, opts)
    , instance = validator.o
  ;

  opts = opts || {};
  Object.keys(instance.features).forEach(function(code){
    instance[code] = is.Number(opts[code])? opts[code] : null;
  });

  return validator;
}, BaseValidator.prototype, {
  message: 'Introduza un número válido.',
  code: 'invalid_number',
  features: {
    match_value: function( value, limit ){ return value != limit; },
    max_value: function( value, limit ){ return value > limit; },
    min_value: function( value, limit ){ return value < limit; }
  },
  messages: {
    match_value: 'Garanta que este valor sexa %(match_value)s (agora é %(clean_value)s).',
    max_value: 'Garanta que este valor sexa menor ou igual a %(max_value)s.',
    min_value: 'Garanta que este valor sexa maior ou igual a %(min_value)s.'
  },
  clean: function( value ){
    return value;
  },
  validate: function( value ){
    value = this.clean(value);
    if( !is.Number(value) ){
      throw ValidationError( this.message, this.code );
    }
    Object.keys(this.features).forEach(function(code){
      if( this[code] !== null && this.features[code](value, this[code]) ){
        var params = { clean_value: value };
        params[code] = this[code];
        throw ValidationError( this.messages[code], code, params );
      }
    }, this);
    return Number( value.toString().replace(',', '.') );
  }
});

exports.Number = NumberValidator;

/**
 * @builder LengthValidator
 *
 * A numeric validator for value's length
 *
 */

var LengthValidator = oop.builder(function(opts){
  return NumberValidator.call( this, opts );
}, NumberValidator.prototype, {
  //message: 'A lonxitude deste valor debe ser un número válido.',
  messages: {
    match_value:  'Garanta que a lonxitude deste valor sexa %(match_value)s (agora é %(clean_value)s).',
    max_value: 'Garanta que a lonxitude deste valor sexa menor ou igual a %(max_value)s.',
    min_value: 'Garanta que a lonxitude deste valor sexa maior ou igual a %(min_value)s.'
  },
  clean: function( value ){
    return value && value.length || 0;
  }
})

exports.Length = LengthValidator;
