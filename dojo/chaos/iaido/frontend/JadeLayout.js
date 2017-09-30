var iai = require('iai')
  , oop = iai('oop')
;

try{
  var jade = require('jade')
} catch(err){
  throw Error("JadeLayout depends on jade, please install it")
}

var Parent = require('./Layout');

var exports = module.exports = oop.builder(function( filepath ){
  var template = jade.compile(
    require('fs').readFileSync( filepath )
  );
  return Parent.call( this, template );
}, Parent.prototype)

exports.version = "1";
exports.stability = 1;
