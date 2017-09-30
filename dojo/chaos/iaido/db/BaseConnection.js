var oop = require('iai-oop')
  , iai = require('../..')
  , Parent = iai('async/Heap')
;

var exports = module.exports = oop.builder(function(){
  return Parent.call(this);
}, Parent.prototype, {
  open: function(){
    //console.log( this+"#open should be redefined, not inherited" );
    return this;
  },
  close: function(){
    //console.log( this+"#close should be redefined, not inherited" );
    return this;
  },
  toString: function(){
    return "[object Connection]";
  }
});

exports.version = "0";
exports.stability = 1;
