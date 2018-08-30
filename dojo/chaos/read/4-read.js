var assert = require('assert');
var PassThrough = require('stream').PassThrough;
var iai = require('..');
var log = iai.log;
var helper = require('./helper');
var read = iai.read;

module.exports = TEST;
if( require.main === module ){
  process.on( 'exit', helper() );
  TEST();
}

function TEST(){
  // sync tests here
  assert.equal( typeof read, 'function', 'read should be a function' );

  TESTN1();
}

function emulateKeyboard( str, opts ){
  opts = opts || {};
  var wait = 1 * (opts.time||1);
  var debug = opts.debug || false;
  debug && log.verb( 'KB EMULAT TIME', wait>1000? (wait/1000)+'s' : wait+'ms' );

  var input = new PassThrough();
  //if( !sleep ){ input.push( str ); return input(); }
  var sequence = Array.prototype.slice.call(str).map(function( ch, c ){
    return function(){
      debug && log.verb( 'KB KEYPRESS %s', JSON.stringify(ch) );
      input.write(ch);
      if( sequence.length ){
        debug && log.verb( 'KB NEXT IN', wait );
        setTimeout(sequence.shift(), wait );
      }
    };
  });
  sequence.push(function(){ debug && log.verb('KB END', str); input.end(); });
  process.nextTick( sequence.shift() )
  return input;
}

function TESTN1(){
  var sequence = '\n\n123\n';
  var input = emulateKeyboard( sequence, { /*debug: true /**/ } );
  var count = 0;
  var plan = sequence.length;
  iai.read( input, { n: 1 }).on('readable', function(){
    var data = this.read();
    if( data === null ){
      // input has end
      return;
    }
    assert.ok( data, 'expected some data, '+data );
    assert.equal( data.length, 1, 'expected/* data length of 1');
    assert.equal( data, sequence[count] );

    count++;
    assert.ok( count <= plan, 'expected less or' + plan );
  }).on( 'end', function(){
    assert.equal( count, plan );
    log.debug('read -n 1 OK');
    setTimeout( TESTN2, 100 );
  }).on( 'error', function(){
    throw new Error("it shouldn't TIMEOUT");
  });
}

function TESTN2(){
  var sequence = '\nabcd\nefg';
  var input = emulateKeyboard( sequence, { /*debug: true /**/ } );
  var count = 0;
  iai.read( input, { n: 3 }, function( err, data ){
    assert.ok( ++count == 1, 'expected only one execution' );
    assert.ok( err === null, 'expected no error' );
    assert.ok( data, 'expected some data' );
    assert.equal( data.length, 3, 'expected data length of 1');
    assert.equal( data, '\nab' );

  }).on( 'end', function(){
    log.debug('read -n 3 (ONCE) OK, WAIT 1s');
    setTimeout( TESTLINE, 100 );
  }).on( 'error', function(){
    throw new Error("it shouldn't TIMEOUT");
  });
}

// TODO timeout, emit error if reading exceeds a time limit

function TESTLINE(){
  var sequence = 'read this\nand this\nbut not this';
  var result = sequence.split('\n');
  var input = emulateKeyboard( sequence, { /*debug: true /**/ } );
  var count = 0;
  var plan = --result.length;
  iai.read( input, {} ).on('readable', function(){
    var data = this.read();
    if( data === null ) return; // input has end
    assert.ok( data, 'expected some data' );
    assert.equal( data.length, result[count].length, 'bad data length');
    assert.equal( data, result[count] );

    count++;
    assert.ok( count <= plan, 'expected less or' + plan );
  }).on('end', function(){
    assert.equal( count, plan );
    log.debug('read OK, WAIT 500ms');
    setTimeout( TESTLINE2, 100 );
  }).on( 'error', function(){
    throw new Error("it shouldn't TIMEOUT");
  });
}

function TESTLINE2(){
  var sequence = '\nread this only\nstrip this';
  var input = emulateKeyboard( sequence, { /*debug: true /**/ } );
  var count = 0;
  iai.read( input, {}, function( err, data ){
    assert.ok( ++count == 1, 'expected only one execution' );
    assert.ok( data, 'expected some data' );
    assert.equal( data, 'read this only' );

    log.debug('read ONCE OK');
    setTimeout( TESTIMEOUT, 100 );
  });
}

function TESTIMEOUT(){
  var input = emulateKeyboard('12345', { time: 15 /*,debug: true/**/ });

  var to = setTimeout(function(){
    throw new Error('it should emit error on less than 30ms');
  }, 30);

  iai.read( input, { t: 15 })
    .on('error', function onError(){
      clearTimeout(to);
      assert.equal( this.read(), null, 'it should not pass through' );
      log.debug('read --timeout ok');
      setTimeout( TESTINTERRUPT, 100 );
    })
  ;
}

// TODO
function TESTINTERRUPT(){
  var input = emulateKeyboard('12\u0003abc', { /*debug: true/**/ });

  var count = 0;
  iai.read( input, { n: 1, t: 10 })
    .on('error', function onError(){
      throw new Error('it should not timeout');
    })
    .on('readable', function(){
      if( this.read() !== null ){
        count++;
      }
    })
    .on('end', function(){
      assert.equal( count, 2 );
      assert.ok( this.read() === null, 'no more data expected' );
      setTimeout( TESTSTDIN, 100 );
    })
  ;
}

// TODO test with stdin (check raw mode with SIGINT)
function TESTSTDIN(){
  var end = false;
  iai.read( process.stdin, { n: 1, t: 1000 })
    .on('error', function onError(){
      throw new Error('it should not timeout');
    })
    .on('end', function(){
      assert.ok( !process.stdin.isRaw, 'stdin raw mode should be false' );
      end = true;
    })
  ;
  process.on('exit', function( code ){
    assert.ok( end, 'end should had emitted' );
    assert.equal( code, 2, 'code should be 2' );
    process.exit(0);
  });
  process.kill( process.pid, 'SIGINT' );
}
