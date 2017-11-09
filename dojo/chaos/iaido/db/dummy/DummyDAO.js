var oop = require('iai-oop')
  , Parent = require( '../BaseDAO' )
;

var exports = module.exports = oop.builder(function(){
  return Object.create(this);
}, Parent.prototype, {
  toString: function(){
    return "[object DummyDAO]";
  }
})

exports.version = "0";
exports.stability = 1;
