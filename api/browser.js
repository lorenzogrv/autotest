/**
 * Author: Lorenzo García Rivera
 * License: MIT
 */

const agnostic = require('./agnostic')

// the iai object for browser inherits everything from iai agnostic object
const iai = module.exports = Object.create(agnostic)

/*
 * This file is main entry point for code *meant to be run within a browser*
 * Define here only the namespace aliases
 * Don't define lazy-load accesors as browserify will not understand them
 */

// there is no need to use the oop api to override things as needed

// override path.__dirname so paths resolve as they should
iai.path.__dirname = '/'

// FROM HERE ONWARDS
// will use iai-oop api to expose the augmented api
//
var exports = iai.oop(iai)

// ugly but working hack to stop-and-debug at browser
exports.visible('debug', require('iai-abc/lib/tool/debug'))

// User interface implementation
exports.visible('ui', require('./ui'))

// View prototype implementation
// TODO deprecate this
