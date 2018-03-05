var iai = require('iai')
  , oop = require('iai-oop')
  , BaseError = iai('core/ErrorBuilder')
  , format = iai( 'utils/replaceTags' )
;

/**
 * @builder ValidationError: An error thrown while validating data
 *
 */

module.exports = oop.builder(function( message, code, params){
  message = format( message || 'no message given', params || {} );
  return oop( BaseError.call(this, message) )
    .set('code', code)
    .o
  ;
}, BaseError.prototype, {
  name: 'ValidationError'
})

module.exports.version = "2";
module.exports.stability = 2;

/*
function VError( message, code, params ){
  var instance = Object.create( VError.prototype );
  instance.message = format( message || "Unknown error", params || {} );
  instance.code = code;
  Error.captureStackTrace( instance, VError )
  return instance;
}

VError.prototype = Object.create( Error.prototype );
VError.prototype.name = "ValidationError";
*/
