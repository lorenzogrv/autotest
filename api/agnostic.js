/**
 * Author: Lorenzo García Rivera
 * License: MIT
 */

const abc = require('../abc')

// the iai object inherits the iai-abc exposed api
const iai = module.exports = Object.create(abc)

/*
 * This file is main entry point for code *shared between backend and fronted*
 * Define here only the namespace aliases
 * Don't define lazy-load accesors as browserify will not understand them
 */

// override the iai-abc toString data descriptor
iai.toString = () => '|iai-api|'

// FROM HERE ONWARDS
// will use iai-oop api to expose the augmented api
//
var exports = iai.oop(module.exports)

// Service prototype implementation
exports.visible('Service', require('./service'))
// master service
exports.visible('service', iai.Service.create())
// Section prototype implementation
exports.visible('Section', require('./section'))
