/**
 * Author: Lorenzo García Rivera
 * License: MIT
 */

const { inspect } = require('util')
const agnostic = require('./agnostic')

// the iai object for browser inherits everything from iai agnostic object
const iai = module.exports = Object.create(agnostic)

/*
 * This file is main entry point for code *meant to be run within a browser*
 * Define here only the namespace aliases
 * Don't define lazy-load accesors as browserify will not understand them
 */
//

// there is no need to use the oop api to override things as needed

// override path.__dirname so paths resolve as they should
iai.path.__dirname = '/'

// ugly but working hack to display an error on-screen
iai.fatal = function fatal (msg, file, line, column, error) {
  var title = error ? error.message || error : msg
  var stack = error.stack || Error('no stack trace').stack
  document.body.innerHTML = '<h1>' + title + '</h1>'
  document.body.innerHTML += '<pre>' + stack + '</pre>'
  document.body.innerHTML += '<pre>' + inspect(error, { showHidden: true, depth: 4, showProxy: true }) + '</pre>'
  return true
}

// The hack above is meant for window.onerror
if (window) window.onerror = iai.fatal

// ugly but working hack to stop-and-debug at browser
iai.debug = function debug (obj, title) {
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

// FROM HERE ONWARDS
// will use iai-oop api to expose the augmented api
//
var exports = iai.oop(iai)

// View implementation
exports.visible('View', require('./view'))
