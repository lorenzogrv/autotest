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
iai.toString = function () { return '|iai-abc|' }

iai.f = require('util').format

// from hereafter, use iai-oop to define exports
var exports = oop(module.exports)

// the "oop" namespace is reserved (not writable) for the OOP standard API
exports.visible('oop', oop)
// the "is" namespace is reserved (not writable) for the iai-is API
exports.lazyload('is', require, 'iai-is')

// the "path" namespace is reserved (not writable) for the path api
exports.lazyLoad('path', require, './path')

// the "Log" and "log" namespaces are reserved for accessing the logger api
exports.lazyLoad('Log', require, './log')
exports.accessor('log', function getLog () {
  return iai.Log.constructor(getLog)
})

// "error" namespace is reserved for the custom error toolset
exports.lazyLoad('error', require, './error')
// "Error" namespace is reserved for CustomError constructor
exports.lazyLoad('Error', function () {
  var CustomError = require('./error/CustomError')
  return CustomError.constructor.bind(CustomError)
})

exports.lazyLoad('packdata', require, './tool/packdata')

// setup process bindings
// TODO this is too ugly (but actually process.js only binds events)
require('./process.js')
