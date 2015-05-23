var assert = require('assert');
var iai = require('..');

module.exports = TEST;
require.main === module && TEST();

function TEST(){
  assert(
      iai.is === require('iai-is'),
      'is namespace should store the iai-is module api'
  );

  iai.is = null;
  assert(
      iai.is === require('iai-is'),
      'is namespace should be non-writable'
  );

  delete iai.is;
  assert(
      iai.is === require('iai-is'),
      'is namespace should be non-configurable'
  );

  // FINISHING
  var sources = require('../api/sources')( module )
  try {
    assert.equal( sources.length, 5 );
  } catch( error ){
    console.error('WARN: This test should require 5 source files exactly');
    console.error( 'source files required:\n  %s', sources.join('\n  ') );
  }
}
