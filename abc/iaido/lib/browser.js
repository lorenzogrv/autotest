
var oop = require('iai-oop')
var $ = require('jquery')

oop(module.exports)
  .visible('oop', oop)
  .visible('$', $)
  // .visible('svg', require('./svg'))
  .visible('bootstrap', bootstrap)

// initializes the client application given the browser window context
function bootstrap (window) {
  console.log('bootstrap window for', window.location)
}
