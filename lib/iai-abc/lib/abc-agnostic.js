/**
 * Author: Lorenzo García Rivera
 * License: MIT
 */

var oop = require('iai-oop')

//
// This file is the main entry point.
// Define here only the namespace aliases or accessors
//

var iai = module.exports

// make it prettier than [object Object]
iai.toString = () => '|iai-abc|'

iai.f = require('util').format

// from hereafter, use iai-oop to define exports
var exports = oop(module.exports)

// the "oop" namespace is reserved (not writable) for the OOP standard API
exports.visible('oop', oop)
// the "path" namespace is reserved (not writable) for the path api
exports.visible('path', require('./path'))

// the "Log" and "log" namespaces are reserved for accessing the logger api
exports.visible('Log', require('./log'))
exports.accessor('log', function getLog () {
  throw new Error('This should be implemented on backend or browser')
})

const { CustomError } = require('./error')
// "Error" namespace is reserved for CustomError constructor
exports.visible('Error', CustomError.constructor.bind(CustomError))

// setup process bindings (window bindings on browserified bundles)
// TODO this is too ugly (but actually is meant to binds events and the like)
exports.visible('proc', require('./process.js'))
