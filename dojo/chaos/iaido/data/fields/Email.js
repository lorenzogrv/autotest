var oop = require('iai-oop')
  , iai = require('iai')
  , validators = iai('data/validators')
  , Parent = iai('data/Field')
;

/**
 * @builder Email
 */

module.exports = oop.builder(function(opts){
  opts = opts || {};
  return oop( Parent.call(this, opts) )
    .o
  ;
}, Parent.prototype, {
  validate: function( data, callback ){
    return Parent.prototype.validate.call(this, data, function(err, data){
      if( err ){
        return callback(err)
      }
    });
  }
})

module.exports.version = "1";
module.exports.stability = 2;
