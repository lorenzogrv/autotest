var assert = require( "chai" ).assert
  , iai = require( "../.." )
  , Queue = iai( "async/Queue" )
  , test = iai( "test" )
;

describe( "async/Queue", function(){
  it( "should be a builder", function(){
    assert.isFunction( Queue, [function(){}] );
  })
  it( "should throw a TypeError if argument given is not a function", function(){
    var cases = {
      "empty string": "",
      "string": "foo bar baz",
      "undefined": "".undefined_property,
      "null": null,
      "a Number": 456,
      "an Array": [ 1, 50, 'foo', { a: 2 } ],
      "an Object": { a: 1, b: 2, c: [1, 2, 3] }
    };
    for( var name in cases ){
      assert.throws(function( name ){
        Queue( cases[name] )
      }.bind({}, name), TypeError, /must be a function/, name);
    }
  })
})

describe( "Queue instances", function(){
  it( "should inherit from Notifier", function(){
    assert.instanceOf( Queue(function(){}), iai("async/Notifier") );
  })

  it( "should have the following api", function(){
    test.chainableApi( Queue(function(){}), {
      "emit": [ "drained" ],
      "once": [ "event", function(){} ],
      "on": [ "event", function(){} ],
      "push": [ "data" ]
    })
  })

  describe( "#push", function(){
    it( "should execute the worker if Queue is empty", function(done){
      var q = Queue(function worker( data, callback ){
        done();
      }).push( "something" )
    })
    it( "should pass to the worker the args expected", function(done){
      var something = { o: 0, b: 1 };
      var q = Queue(function worker( data, callback ){
        assert.deepEqual( data, something, 'data received' );
        assert.isFunction( callback, 'callback is function' );
        done();
      }).push(something)
    })
    it( "should query datas while working and process them in order", function(done){
      var order = [], count = 1
      function counter(){ return count++; };
      var q = Queue(function worker( data, callback ){
        order.push( data() );
        setTimeout(callback, 5);
      })
      .push(counter).push(counter).push(counter).push(counter)
      .push(function(callback){
        assert.deepEqual( order, [1,2,3,4] );
        done();
      })
      ;
    })
  })
  describe( "the worker callback function", function(){
    it( "should emit given error", function(done){
      var pass = Error("Oops");
      Queue(function worker( data, callback ){
        setTimeout(function(){
          callback( pass );
        }, 20);
      })
      .on( "error", function( err ){
        assert.deepEqual( err, pass );
        done();
      })
      .push( {} ) // execute worker
    });
    it( "should skip next datas given an error", function(done){
      var pass = Error( "this will be thrown" );
      var q = Queue(function worker(data, callback){
        callback( data );
      })
      .push( pass )
      .push( Error( "this should not be thrown") )
      .push( Error( "neither this") )
      .on( 'error', function(err){
          assert.equal( err, pass );
          done();
       })
      ;
    })
    it( "should emit an error thrown on the worker", function(done){
      var pass = Error( "Oh no!" );
      Queue(function( data, callback ){
        throw pass;
      })
      .on( "error", function( err ){
        assert.deepEqual( err, pass );
        done();
      })
      .push( "data" )
    })
    it( "should pass to the worker an array as third argument with "
       +"arguments received by the previous done function", function(testDone){
      this.timeout(10);
      Queue(function worker( data, done, previous ){
        assert.isArray( previous, "previous should be an Array" )
        switch(data){
          case 1:
            return done( null, "next is one" );
          case 2:
            assert.equal( previous[0], "next is one" );
            return done( null, "one pamela", "two pamela" );
          case 3:
            assert.equal( previous[0], "one pamela" );
            assert.equal( previous[1], "two pamela" );
            return done( null, null, 3, "secret", "cat" );
          case 4:
            assert.isNull( previous[0] );
            assert.equal( previous[1], 3 );
            assert.equal( previous[2], "secret" );
            assert.equal( previous[3], "cat" );
            return done();
          case 5:
            testDone();
            return done();
        }
      })
      .push(1).push(2).push(3).push(4).push(5)
    })
  })
})
