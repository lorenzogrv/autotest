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
    .on('readable', function(){
      throw new Error('it should not become readable');
    })
    .on('end', function(){
      assert.ok( !process.stdin.isRaw, 'stdin raw mode should be false' );
      end = true;
    })
  ;
  process.on('exit', function( code ){
    assert.ok( end, 'end should had emitted' );
    assert.equal( code, 44, 'code should be the provided' );
    process.exit(0);
  });
  process.exit( 44 );
}
