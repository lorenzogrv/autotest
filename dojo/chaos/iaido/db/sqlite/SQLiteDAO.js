var oop = require('iai-oop')
  , Parent = require( '../BaseDAO' )
;

var exports = module.exports = oop.builder(function(schema){
  return oop( Parent.call(this) )
    .o
  ;
}, Parent.prototype, {
  toString: function(){
    return "[object SQLiteDAO]";
  }
})

exports.version = "1";
exports.stability = 2;
