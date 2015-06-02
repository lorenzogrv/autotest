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

// the "oop" namespace is reserved (not writable) for the OOP standard API
exports.visible('oop', oop);

// make it prettier than [object Object]
exports.hidden('toString', function(){
  return '|iai|';
})

// the "is" namespace is reserved for accessing the iai-is api
var is;
exports.accessor('is', function getIs( ){
  // ternary operator with assignment to avoid repeating the require call?
  return is? is : is = require('iai-is');
});

// the "sources" namespace is reserved to TODO description
exports.accessor('sources', function getIs( ){
  return require('./api/sources');
});

exports.accessor('read', function getRead( ){
  return require('./api/read');
});

// the "log" namespace is reserved for accessing the log api
var log;
exports.accessor('log', function getLog( ){
  // ternary operator with assignment to avoid repeating the require call?
  // TODO this will cause callsite to be fetched always
  // TODO so it's better only one iai.log per file
  // TODO the catching behaviour should be here too?
  return (( log? log : log = require('./api/log') ))( getLog );
});

// TODO this should be on iai-oop (or at api level related to modules)
if( process.env.NODE_ENV === 'test' ){
  var assert = require('assert');
  var target = './api/sources';
  var t = require( target );
  var oldRequire = require;
  var count = 0;
  var require = function(){
    count++;
    return oldRequire.apply( oldRequire, arguments );
  }
  var mod;
  function lazyLoad(){
    return mod ||(  mod = require.apply(require, arguments)  );
  }
  assert.strictEqual( lazyLoad(target), t, 'load 1 should return exports' );
  assert.strictEqual( lazyLoad(target), t, 'load 2 should return exports' );
  assert.strictEqual( lazyLoad(target), t, 'load 3 should return exports' );
  assert.equal( count, 1, 'require should be called only once' );
  console.error( __filename, 'TESTED LAZY LOADING' );
}

