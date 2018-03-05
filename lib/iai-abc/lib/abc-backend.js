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

// the "is" namespace is reserved (not writable) for the iai-is API
exports.lazyload('is', require, 'iai-is')

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

// tools related to the commonjs module system
exports.lazyLoad('packdata', require, './tool/packdata')
exports.lazyLoad('sources', require, './tool/sources')
