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
iai.toString = function () { return '|iai|' }
