var oop = require('iai-oop')
  , iai = require('iai')
  , ValidationError = require('./ValidationError')
  , Parent = iai('core/ErrorList')
;

module.exports = oop.builder(Parent, Parent.prototype, {
  builder: ValidationError
});

module.exports.version = "2";
module.exports.stability = 1;
