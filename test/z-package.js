
try {
  var iai = require('..');
} catch( err ){
  console.error('requiring this package should not throw');
  console.error( err.stack || err );
  process.exit(1);
}

var assert = require('assert');

assert.equal( iai.sources(module).length, 4, 'expected exactly 4 sources' );
