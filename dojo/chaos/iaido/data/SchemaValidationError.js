var iai = require('iai')
  , oop = require('iai-oop')
  , Parent = require('./ValidationError')
  , isArray = Array.isArray
;


module.exports = oop.builder(function(){
  return oop( Parent.call(this, this.message, this.code) )
    .visible('errors', {})
    .visible('map', {})
    .o
  ;
}, Parent.prototype, {
  name: "SchemaValidationError",
  message: "Houbo varios erros durante a validación deste esquema de datos.",
  code: "invalid_schema",
  // adds an error regarding a field
  add: function( field_id, error ){
    if( !field_id ){
      throw new ReferenceError("field_id not given.");
    }
    if( !(error instanceof Parent) ){
      throw new TypeError("error must be an instance of ValidationError");
    }
    this.errors[field_id] = this.errors[field_id] || [];
    this.errors[field_id].push(error);
    this.map[field_id] = this.map[field_id] || [];
    this.map[field_id].push( { code: error.code, message: error.message} );
    return this;
  }//,
  /*toString: function(){
    return this.name+":"+this.message
  }*/
});


module.exports.version = "1";
module.exports.stability = 1;
