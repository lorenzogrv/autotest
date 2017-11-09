var oop = require('iai-oop')
;

/**
 * @builder BaseError
 *
 */

module.exports = oop.builder(function BaseError( message ){
  var err = new Error(message)
    , instance = Object.create(this);
  ;
  instance.name = this.name;
  instance.message = err.message;
  instance.stack = err.stack;
  return instance;
}, Object.create(Error.prototype), {
  name: "ErrorBuilder"
});

module.exports.version = "1";
module.exports.stability = 2;
