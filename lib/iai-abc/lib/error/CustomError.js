var format = require('util').format

// CustomError inherits from Error
module.exports = Object.create(Error.prototype)

// constructor is overrided
module.exports.constructor = CustomError
// constructor.prototype is set (so instanceof works as expected)
module.exports.constructor.prototype = module.exports

function CustomError (message) {
  // TODO should I use module.exports.isPrototypeOf(this) instead?
  var instance = this instanceof CustomError ? this : Object.create(this)

  message = format.apply(null, arguments)
  var err = new Error(message)
  instance.message = err.message
  instance.stack = err.stack
    // remove from the stack the line 15 of this __file
    .split('\n').filter((e, i) => i !== 1).join('\n')
    // TODO how much dangerous is this?

  return instance
}

// Native Error has a name property, so override it too
module.exports.name = module.exports.constructor.name
