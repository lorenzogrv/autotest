var assert = require('assert');

module.exports = TEST;
require.main === module && TEST();

function TEST(){
  try {
    var iai = require('..');
  } catch( err ){
    console.error('requiring this package should not throw');
    console.error( err.stack || err );
    process.exit(1);
  }

  try {
  assert.equal( iai.sources(module).length, 4, 'expected exactly 4 sources' );
  } catch( err ){
    console.log( iai.sources(module) );
    throw err;
  }
}
