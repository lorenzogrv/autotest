var path = require('path')
var slice = Array.prototype.slice

//
// The iai-abc "path" API is just a chainable thing based on node's path API
//

var exports = module.exports = createPathAPI

// It works based on the package directory by default
exports.__dirname = path.dirname(__dirname)

// But can be bound to another directory calling it by convenience
function createPathAPI (directory) {
  var instance = Object.create(module.exports)
  instance.__dirname = path.resolve(path.join.apply(null, arguments))
  return instance
}

// joins any number of arguments to this.__dirname with path.join
exports.to = function () {
  return path.join.apply(0, [this.__dirname].concat(slice.call(arguments)))
}
