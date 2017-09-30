var iai = require('iai')
  , oop = iai('oop')
  , is = iai('is')
;
/**
 * @builder Data: The interface for Data validation structures.
 * @internal {string} _type: Name of the Data type
 */

var exports = module.exports = oop.builder(function(opts){
  return oop.create(this)
    .internal( '_type', 'Field' )
    .o
  ;
}, null, {
  /**
   * @function error: Returns an Error instance
   *
   * Implementations are suposed to override this method.
   * Usually it will be a binding of ValidationError or other custom Error.
   */
  error: Error.bind("Objects inheriting Data must implement #validate"),
  /**
   * @function validate: Checks the given data is valid.
   *
   * Asynchronously, performs all necessary checks to determine if the
   * given data is valid and passes results on to the given callback function.
   */
  validate: function( data, callback ){
    if( "function" !== typeof callback ){
      throw new TypeError("callback should be a function");
    }
    throw this.error();
    return this;
  },
  /**
   * @function keys: Returns an array consisting of the stored keys.
   */
  keys: function(){
    return Object.keys(this).filter(function(n){
      // remove properties being functions
      return 'function' !== typeof this[n];
    }, this);
  },
  /**
   * @function vals: Returns an array consisting of the stored values.
   */
  vals: function(){
    return this.keys().map(function(n){ return this[n]; }, this);
  },
  /**
   * @function toString: Returns a string representation of the structure.
   *
   * The convention is `<_type [property=value, propertyBeingtrue]>`
   * where `_type` is the value of the internal self-named property.
   */
  toString: function(){
    return "<"+(this._type||"Data")+" ["
      + this.keys()
        // remove properties being false
        .filter(function(n){ return this[n] !== false; }, this)
        // display only name for values being true
        .map(function(n){ return this[n] === true? n : n+'='+this[n]; }, this)
        .join(', ')
      + "]>"
    ;
  }
})

exports.version = "1";
exports.stability = 1;
