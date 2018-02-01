/**
 * Author: Lorenzo García Rivera
 * License: MIT
 */

var abc = require('./abc');

// the iai object inherits the iai-abc exposed api
var iai = module.exports = Object.create(abc);

//
// This file is the main entry point.
// Define here only the namespace aliases or accessors
//

// there is no need to use the oop api to override things as needed

// override path.__dirname so paths resolve as they should
iai.path.__dirname = __dirname;
// override the iai-abc toString data descriptor
iai.toString = function( ){ return '|iai|'; };

// will use iai-oop api to expose the augmented api
var exports = iai.oop( iai );

// read and readkeys are related to the node stream api
exports.lazyload('read', require, './api/read')
exports.lazyload('readkeys', require, './api/hardware/keyboard/readkeys')

// sources is related to the commonjs module system
exports.lazyload('sources', require, './api/sources');

// the gui api controls an electron process to manage the OS GUI
exports.lazyload('gui', require, './api/hardware/gui');

// Service is a server prototype with built-in WebSocket integration
exports.lazyload('Server', require, './api/server');
exports.lazyload('Router', require, './api/server/Router');

// View implementation
exports.lazyload('View', require, './api/view');
