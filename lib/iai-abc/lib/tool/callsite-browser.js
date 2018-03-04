const v8callsite = require('./callsite.js')

module.exports = callsite

// TODO callsite for browser, based on new Error() instead of V8's callsite api
function callsite (from) {
  from = from || callsite
  console.log(from)
  var stack = (new Error()).stack
    .split('\n')
    .slice(1) // Remove first line (Error type and message)
    .map(line => line.trim().slice(3)) // remove identation and "at "
    .map(line => line.split(' '))
  console.log(stack)
  // TODO research how to convert file urls through js map
  return v8callsite.apply(null, arguments)
}
