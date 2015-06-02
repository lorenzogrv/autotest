/**
 * Author: Lorenzo García Rivera
 * License: MIT
 */

var oop = require('iai-oop');

//
// This file is the main entry point.
// Define here only the namespace aliases or accessors
//

var exports = oop( exports );
var iai = exports.o;

// the "oop" namespace is reserved (not writable) for the OOP standard API
exports.visible('oop', oop);

// the "is" namespace is reserved for accessing the iai-is api
exports.lazyload('is', require, 'iai-is');

// the "log" namespace is reserved for accessing the logger api
exports.lazyload('Log', require, './api/log');
exports.accessor('log', function getLog( ){
  // TODO this will cause callsite to be fetched always
  // TODO so it's better only one iai.log per file
  // TODO the catching behaviour should be here too?
  return iai.Log( getLog );
});
// read is related to the node streams
exports.lazyload('read', require, './api/read');

// sources is related to the commonjs module system
exports.lazyload('sources', require, './api/sources');

// make it prettier than [object Object]
exports.hidden('toString', function(){
  return '|iai|';
});

