var iai = require( 'iai' )
  , oop = iai( 'oop' )
  , Parent = iai( 'core/Resource' )
  , debug = require( 'debug' )( 'iai:core:item' )
;

/**
 * iai resource I+D+i
 */


var exports = module.exports = oop.builder(function( id ){
  return Parent.call( this, id )
}, Parent.prototype, {
});


exports.version = "0";
exports.stability = 1;
