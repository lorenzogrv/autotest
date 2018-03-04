var test = require('tape');

var server = require('../');
var abc = require('iai-abc');

test('server prototype', function( t ){
  var expected, actual;

  actual = server.eventNames(); //console.log( actual );
  expected = [ 'connection', 'listening' ];
  t.deepEqual( actual, expected, 'events bound should be '+expected );

  actual = actual.map( eventName => server.listenerCount(eventName) );
  //console.log( actual );
  expected = [ 1, 1 ];
  t.deepEqual( actual, expected, 'listener counts should be '+expected );

  t.equal( server.listening, false, 'should not be listening' );

  function test1( txt ){
    var count = server.listenerCount('listening');
    t.equal( count, 1, '"listening" event should have 1 listener '+(txt||'') );
  }

  test1('before prototype#listen');
  t.throws(function(){ server.listen(); }, abc.Error, 'prototype#listen should throw');
  test1('after prototype#listen');

  // ensure the events bound to the child server are not bound to the parent
  // whatever the way the child server is created
  var child = Object.create( server );
  child.on('listening', function(){ this.close( t.end.bind(t) ); });
  test1('after binding "listening" on child');
  t.doesNotThrow(function(){ child.listen(); }, 'child#listen should not throw');
  test1('after child#listen');
});

test('server', function( t ){
  var service = Object.create( server );
  service.on('request', function( req, res ){
    t.ok( req, 'expect an incoming message' );
    t.ok( res, 'expect an outgoing response stream' );
    res.on('finish', function(){
      t.pass( 'outgoing response finished' );
      service.close(function( err ){
        t.error( err, 'service should close without errors' );
        t.end();
      });
    }).end() // trigger response end
    this.close( t.end.bind(t) );
  }).on('listening', function(){
    t.pass( 'service is listening as expected' );
    console.log( this.address() );
    //t.fail( 'request should be mocked-up here' );
    // once listening, mock-up a fake request
  }).listen();
});
