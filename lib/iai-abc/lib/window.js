//
// # Utilities to deal with common things of the browse window environment
//

const { inspect } = require('util')
const Log = require('./log')

// TODO fix the callsite thing
Log.clean = true

// ugly hack to pipe logging to browser console
Log.output.on('data', (data) => console.warn(data.toString('utf8')))

const log = Log.constructor(__filename)

// ugly but working hack to display an error on-screen
window.onerror = function fatal (msg, file, line, column, error) {
  var title = error ? error.message || error : msg
  var stack = error ? error.stack : Error('no stack trace').stack
  document.body.innerHTML = '<h1>' + title + '</h1>'
  document.body.innerHTML += '<pre>' + stack + '</pre>'
  document.body.innerHTML += '<pre>' + inspect(error, { showHidden: true, depth: 4, showProxy: true }) + '</pre>'
  // TODO don't prevent default handler to run until callsite is fixed
  return false
}

log.level = Log.INFO
log.info('window bindings were defined')
delete log.level
