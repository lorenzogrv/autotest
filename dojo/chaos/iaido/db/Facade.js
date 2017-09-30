var oop = require('iai-oop')
  , requireBuilder = require( './requireDbBuilder' )
;

var exports = module.exports = oop.builder(function(opts){
  return oop.create(this)
    .visible( 'connection', requireBuilder( opts.system, 'Connection' )(opts) )
    .visible( 'dao', requireBuilder( opts.system, 'DAO' )(opts) )
    .o
  ;
}, {
  find: function(){
    //throw "Facade is a convenience super-prototype";
    return this;
  },
  findOne: function(){
    //throw "Facade is a convenience super-prototype";
    return this;
  },
  create: function(){
    //throw "Facade is a convenience super-prototype";
    return this;
  },
  update: function(){
    //throw "Facade is a convenience super-prototype";
    return this;
  },
  destroy: function(){
    //throw "Facade is a convenience super-prototype";
    return this;
  }
});

exports.version = "0";
exports.stability = 1;

