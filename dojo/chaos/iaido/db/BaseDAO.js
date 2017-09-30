var oop = require('iai-oop')
  , iai = require('../..')
  , Parent = iai('async/Heap')
;

var exports = module.exports = oop.builder(function(opts){
  return Parent.call(this);
}, Parent.prototype, {
  create: function( connection, vo, callback ){
    //console.log( this+"#create should be redefined, not inherited" );
    return this;
  },
  retrieve: function( connection, id, callback ){
    //console.log( this+"#retrieve should be redefined, not inherited" );
    return this;
  },
  update: function( connection, id, vo, callback ){
    //console.log( this+"#update should be redefined, not inherited" );
    return this;
  },
  destroy: function( connection, id, callback ){
    //console.log( this+"#destroy should be redefined, not inherited" );
    return this;
  },
  toString: function(){
    return "[object DAO]";
  }
});

exports.version = "0";
exports.stability = 1;
