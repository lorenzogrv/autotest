/**
 * @function createPlugin: shortcut to define a IaiPlugin prototype that
 * inherits from IaiPlugin.
 */
var exports = module.exports = createPlugin;

exports.version = '1';
exports.stability = 2;

function createPlugin( prototype ){
  return oop.extend( IaiPlugin, prototype );
}

var oop = require( 'iai-oop' );

/**
 * @prototype iai.Plugin: Interface to standarize the api for iai plugins
 *
 * Each plugin for iai must implement the standard REST actions, as methods.
 * Plugin apis should be chainable so these methods should return the current
 * context.
 */

var IaiPlugin = createPlugin.prototype = oop.extend( null, {
  head: function( name, callback ) {
    callback( Err.call( this, "head" ) );
    return this;
  },
  post: function( name, data, callback ) {
    callback( Err.call( this, "post" ) );
    return this;
  },
  get: function( name, callback ) {
    callback( Err.call( this, "get" ) );
    return this;
  },
  put: function( name, data, callback ) {
    callback( Err.call( this, "put" ) );
    return this;
  },
  "delete": function( name, callback ) {
    callback( Err.call( this, "delete" ) );
    return this;
  },
  toString: function(){
    var name = this.constructor? this.constructor.name : "unknown";
    return "[iaiPlugin #<"+name+">]";
  }
});

function Err( name ){
  return Error( this+"#"+name+" is not implemented" );
}
