var assert = require('assert');
var iai = require('..');

module.exports = TEST;

require.main === module && TEST();

function TEST(){

  assert(
      iai.oop === require('iai-oop'),
      'oop namespace should store the iai-oop module api'
  );

  iai.oop = null;
  assert(
      iai.oop === require('iai-oop'),
      'oop namespace should be non-writable'
  );

  delete iai.oop;
  assert(
      iai.oop === require('iai-oop'),
      'oop namespace should be non-configurable'
  );

  // FINISHING
  var sources = require('../api/sources')( module )
  try {
    assert.equal( sources.length, 4 );
  } catch( error ){
    console.error('WARN: This test should require 4 source files exactly');
    console.error( 'source files required:\n  %s', sources.join('\n  ') );
  }
}
