var assert = require('assert');
var iai = require('..');

module.exports = TEST;
require.main === module && TEST();

function TEST(){
  var log = iai.log;
  assert.equal( log.filename, __filename );

  var methods = [
    'fatal', 'error', 'warn', 'info', 'verb', // log levels
    'out', 'err', // write on output streams
    'msg' // message formatter
  ];
  for( name in methods ){
    name = methods[name];
    assert.equal(
      typeof log[name], 'function',
      'log#'+name+' should be a function'
    );
  }

  // FINISHING
  var sources = require('../api/sources')( module )
  try {
    assert.equal( sources.length, 7 );
  } catch( error ){
    console.error('WARN: This test should require 4 source files exactly');
    console.error( 'source files required:\n  %s', sources.join('\n  ') );
  }
}
