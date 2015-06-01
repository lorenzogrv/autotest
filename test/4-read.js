var assert = require('assert');
var PassThrough = require('stream').PassThrough;
var iai = require('..');
var log = iai.log;
var helper = require('./helper');
var read = iai.read;

module.exports = TEST;
if( require.main === module ){
  var last = helper.resume();
  TEST();
}

function TEST(){
  // sync tests here
  assert.equal( typeof read, 'function', 'read should be a function' );

  TESTN1();
}

function emulateKeyboard( str, opts ){
  opts = opts || {};
  opts.time = opts.time === 0? 0 : 1;
  var wait = 1 * opts.time;
  var debug = opts.debug || false;
  var input = new PassThrough();
  //if( !sleep ){ input.push( str ); return input(); }
  var sequence = Array.prototype.slice.call(str).map(function( ch, c, str ){
    return function(){
      debug && log.verb( 'KEYPRESS %s', JSON.stringify(ch) );
      input.write(ch);
      if( sequence.length ){
        debug && log.verb( 'SLEEP %s', wait>1000? (wait/1000)+'s' : wait+'ms' );
        setTimeout( sequence.shift(), wait );
      }
    };
  });
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
    assert.ok( data, 'expected some data' );
    assert.equal( data.length, 1, 'expected/* data length of 1');
    assert.equal( data, sequence[count] );

    count++;
    assert.ok( count <= plan, 'expected less or' + plan );
    if( count == plan ){
      log.debug('read -n 1 OK');
      TESTN2();
    }
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
    log.debug('read -n 3 (ONCE) OK, WAIT 100ms');
    setTimeout( TESTLINE, 100 );
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
    assert.ok( data, 'expected some data' );
    assert.equal( data.length, result[count].length, 'bad data length');
    assert.equal( data, result[count] );

    count++;
    assert.ok( count <= plan, 'expected less or' + plan );
    if( count == plan ){
      log.debug('read OK, WAIT 100ms');
      setTimeout( TESTLINE2, 100 );
    }
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

    log.debug('read ONCE OK, WAIT 10ms');
    setTimeout( TESTIMEOUT, 10 );
  });
}

function TESTIMEOUT(){
  var input = emulateKeyboard('12345678');
  var sequence = iai.read( input, { t: 15 });

  sequence.on('readable', function(){
    throw new Error('it should not become readable');
  });

  var to = setTimeout(function(){
    throw new Error('it should emit error on less than 30ms');
  }, 30);

  sequence.on('error', function onError(){
    clearTimeout(to);
    assert.equal( sequence.read(), null, 'it should not pass through' );
    log.debug('read --timeout ok');
    setTimeout( process.exit, 10 );
  });
}
