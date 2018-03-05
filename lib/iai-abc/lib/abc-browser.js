/**
 * Author: Lorenzo García Rivera
 * License: MIT
 */

var oop = require('iai-oop')

//
// This file is the main entry point.
// Define here only the namespace aliases or accessors
//

var iai = module.exports = Object.create(require('./abc-agnostic'))

// from hereafter, use iai-oop to define exports
var exports = oop(module.exports)

// the "Log" and "log" namespaces are reserved for accessing the logger api
exports.accessor('log', function getLog () {
  // TODO throw new Error('This should be reimplemented for browser')
  return iai.Log.constructor(getLog)
})

// setup window bindings
// TODO this is too ugly (but actually it's meant to binds events and the like)
require('./window.js')
