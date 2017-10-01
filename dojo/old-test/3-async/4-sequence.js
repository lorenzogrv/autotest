var iai = require( '../..' )
  //, test = require( 'iai-test' )
  , assert = require( 'chai' ).assert
  , sequence = iai( 'async/sequence' )
;

describe( "sequence", function(){
  it( "should throw TypeError if argument 2 or 3 is not a function", function(){
    assert.throws(function(){  sequence([]), TypeError  });
    assert.throws(function(){  sequence([], function(){}), TypeError  });
    assert.throws(function(){  sequence([], null, function(){}), TypeError  });
  })
  it( "should execute step once for each item in array", function(done){
    sequence( [1, 2, 3], function( key, val, next ){
      assert.equal( parseInt(key)+1, val, "step "+val );
      next();
    }, done );
  })
  it( "should execute step once for each item in object", function(done){
    var iterable = {
      "1": "first",
      "2": "second",
      "3": "third"
    };
    sequence( iterable, function( key, val, next ){
      assert.equal( iterable[key], val, "step "+key );
      next();
    }, done );
  })
  it( "should preserve the context", function(done){
    var context = {
      "foo": "something",
      "bar": null,
      "baz": "WTF"
    };
    sequence( ['a', 'b', 'c'], function( key, val, next ){
      assert.deepEqual( this, context );
      next();
    }, done, context );
  })
  it( "should fail if next is called with an error", function(done){
    var count = 0;
    sequence(
      ['a', 'b', 'c'],
      function step( key, val, next ){
        count++;
        next( Error("Oops!") );
      },
      function complete(err){
        assert.equal( count, 1, "step should be executed only once" );
        assert.instanceOf( err, Error, "complete should receive an error" );
        assert.equal( err.message, "Oops!", "check error" );
        done();
      }
    );
  })
  it( "should fail with TypeError if next is called with a non-error", function(done){
    sequence([1,2,3], function(k,v,next){ next("bad idea"); }, function(err){
      assert.instanceOf(err, TypeError);
      assert.match(err.message, /received non-error/)
      done();
    })
  })
})
