const { inspect } = require('util')

module.exports = debug

// ugly but working hack to stop-and-debug at browser
function debug (obj, title) {
  document.body.innerHTML = '<pre>' + inspect(obj, {
    showHidden: true, depth: 4, showProxy: true
  }) + '</pre>'
  window.onerror = function (msg) {
    // TODO YAGNI if message does not match, use iai.fatal
    document.body.innerHTML += '<p>Execution stoped intentionally</p>'
    return true // let error stop execution
  }
  throw new Error('execution should stop')
}
