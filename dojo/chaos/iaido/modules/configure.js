var dirname = require( 'path' ).dirname

/**
 * Given an object exported by `file`, load the runtime configuration
 * for itself and descendents.
 *
 * The object exported by `file` is supossed to implement the
 * configurable interface (set, get, enable, disable)
 */

exports = module.exports = iaiConfigure;

exports.version = "1";
exports.stability = 0;

function iaiConfigure( file, callback ) {
  throw "This module does nothing";
  callback( null );
}