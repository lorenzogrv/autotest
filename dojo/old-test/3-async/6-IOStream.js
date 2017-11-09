var chai = require( 'chai' )
  , assert = chai.assert
  , test = require( 'iai-test' )
  , iai = require( '../..' )
  , IOStream = iai( 'async/IOStream' )
  , stream = require( 'stream' )
;

chai.config.includeStack = true;

describe( 'async/IOStream', function(){
  it( 'should be a builder', function(){
    test.builder( IOStream );
  });
});

describe( 'IOStream instances', function(){
  it( 'should inherit from stream.Duplex', function(){
    assert.instanceOf( IOStream(), stream.Duplex );
  });

  it( 'should emit "pipe" when a stream is piped in', function( done ){
    var input = IOStream();
    var io = IOStream();
    io.on('pipe', function( src ){
      assert.deepEqual( src, input );
      done();
    });
    input.pipe( io );
  });

  describe( '#end', function(){
    it( "should be a function", function(){
      var io = IOStream();
      assert.isFunction( io.end );
    })
    it( 'should emit "finish" when called', function( done ){
      var io = IOStream();
      io.on( 'finish', done );
      io.end( );
    });
    it( 'should emit "end" when called if not paused', function( done ){
      var io = IOStream();
      io.on( 'end', done );
      io.resume()
      io.end( );
    });
  });

  describe( '#write', function(){
    it( 'should emit "data" each time is called', function( done ){
      var io = IOStream();
      var messages = [
        "something", "foo", "bar", "beep", "boop", "etc"
      ];
      var n = 0;
      io
        .on('data', function( chunk ){
          assert.equal( chunk, messages[n++], 'assert message '+n );
        })
        .on('end', function(){
          assert.equal( n, messages.length, 'assert n messages' );
          done();
        })
      ;
      messages.forEach(function( msg ){ io.write( msg ); });
      io.end();

    });
    it( 'should emit "readable" when called', function( done ){
      var io = IOStream()
        , n = 0
        , messages = [
          "something", "foo", "bar", "beep", "boop", "etc"
        ]
      ;
      io.on('readable', function(){
          assert.deepEqual( this, io, 'check context' );
          var chunk;
          while( null !== (chunk = this.read()) ){
            assert.equal( chunk, messages[n++], 'check message '+n );
          }
        })
        .on('end', function(){
          assert.equal( n, messages.length, 'assert n messages' );
          done();
        })
      ;
      messages.forEach(function( msg ){ io.write( msg ); });
      io.end();
    });
  });

  describe( '#input', function(){
    it( "should be a function", function(){
      var io = IOStream();
      assert.isFunction( io.input );
    })
    it( "should pipe in given stream returning itself", function( done ){
      var input = IOStream();
      var io = IOStream();
      io.on('pipe', function( src ){
        assert.deepEqual( src, input, 'check source' );
        done();
      });
      assert.deepEqual( io.input( input ), io, 'check return' );
    });
  });
});
