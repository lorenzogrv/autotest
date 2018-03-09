var assert = require('assert');
var iai = require('..');

module.exports = TESTSTDIN;

require.main === module && TESTSTDIN();

// TODO test with stdin (check raw mode with SIGINT)
function TESTSTDIN(){
  var end = false;
  iai.read( process.stdin, { n: 1, t: 1000 })
    .on('error', function onError(){
      throw new Error('it should not timeout');
    })
  ;
  process.on('exit', function( code ){
    assert.ok( !process.stdin.isRaw, 'stdin raw mode should be false' );
    assert.equal( code, 99, 'code should be 99' );
    process.exit(0);
  });
  throw new Error('test it');
}
