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

// the oop namespace is reserved (not writable) for the OOP standard API
exports.visible('oop', oop);

// the log namespace is reserved for accessing the log service
var log;
exports.accessor('log', function getLog( ){
  // ternary operator with assignment to avoid repeating the require call
  return (( log? log : log = require('./api/log') ))( getLog );
});

