var assert = require( "chai" ).assert
  , test = require( "iai-test" )
  , iai = require( "../.." )
  , Heap = iai( "async/Heap" )
;

describe( "async/Heap", function(){
  it( "should be a builder", function(){
    test.builder( Heap )
  })
})

describe( "Heap instances", function(){
  beforeEach(function(){
    this.heap = Heap();
  })

  it( "should inherit from notifier", function(){
    assert.instanceOf( this.heap, iai( "async/Notifier" ) );
  })

  it( "should have the following chainable api", function(){
    test.chainableApi( this.heap, {
      "task": [ function( done ){} ],
      "then": [ function(){} ],
      "fail": [ function( err ){} ]
    });
  })

  describe( "#task", function(){
    it( "should execute given task if none tasks added yet", function(done){
      this.heap.task(function(callback){
        done();
      })
    })
    it("should execute the task function as expected", function(done){
      var api = this.heap.task(function(callback){
        assert.deepEqual( this, api, "context is not the current api" )
        assert.isFunction( callback, "callback is not a function" )
        done();
      })
    })
    it( "should emit the error passed to callback", function(done){
      var pass = Error("Oops!");
      this.heap.task(function(callback){
        callback( pass );
      }).on( 'error', function(err){
        assert.deepEqual( err, pass );
        done();
      })
    })
    it( "should be able to pass arguments to next task", function(testDone){
      var heap = this.heap
        .task(function(next){
          next( null, "one", "two", "three" )
        })
        .task(function(next, a1, a2, a3){
          assert.deepEqual( this, heap, "context broken" );
          assert.equal( a1, "one", "argument 1" );
          assert.equal( a2, "two", "argument 2" );
          assert.equal( a3, "three", "argument 3" );
          next( null, "top secret" )
        })
        .task(function(next, secret){
          assert.equal( secret, "top secret" )
          testDone()
        })
      ;
    })
    it( "should skip all tasks if callback receives error", function(done){
      var pass = Error( "something happened" )
      this.heap
        .task(function(callback){
          callback( pass )
        })
        .task(function(callback){
          done( Error( "this should be skiped") );
        })
        .on( 'error', function(err){
          assert.equal( err, pass );
          done();
        })
      ;
    })
    it( "should emit an error thrown on the task", function(done){
      var oops = Error( "Oops" );
      this.heap
      .task(function(callback){
        throw oops;
      })
      .on('error', function(err){
        assert.deepEqual( err, oops );
        done();
      })
    })
    it( "should throw TypeError if given argument is not a function", function(){
      var heap = this.heap;
      assert.throws(function(){
        heap.task({});
      }, TypeError)
    })
    it( "should throw TypeError if given function length is 0", function(){
      var heap = this.heap;
      assert.throws(function(){
        heap.task( function(){} );
      }, TypeError)
    })
  })

  describe( "#then", function(){
    it( "should execute given function if queue is empty", function(done){
      this.heap.then(function(){
        done();
      })
    })
    it("should execute given function within the current context", function(done){
      var api = this.heap.then(function(){
        assert.deepEqual( this, api, "context is not the current api" )
        done();
      })
    })
    it( "should emit an error thrown on given function", function(done){
      var oops = Error( "Oops" )
        , heap = this.heap
      ;
      assert.doesNotThrow(function(){
        heap
          .then(function(){
            throw oops;
          })
          .on('error', function(err){
            assert.deepEqual( err, oops );
            done();
          })
      })
    })
    it( "should receive arguments from the previous 'async' task", function(testDone){
      var heap = this.heap
        .task(function(next){
          next( null, "one", "two", "three" )
        })
        .then(function(a1, a2, a3){
          assert.deepEqual( this, heap, "context broken" );
          assert.equal( a1, "one", "argument 1" );
          assert.equal( a2, "two", "argument 2" );
          assert.equal( a3, "three", "argument 3" );
          testDone();
        })
      ;
    })
    it( "should skip all tasks if given function throws an error", function(testDone){
      var pass = Error( "something happened" )
      this.heap
        .then(function(){
          throw pass;
        })
        .then(function(){
          testDone( Error( "this should be skiped") );
        })
        .on( 'error', function(err){
          assert.equal( err, pass );
          testDone();
        })
      ;
    })
  })

  describe( "#fail", function(){
    it( "should add a listener for the 'error' event", function(testDone){
      var pass = Error("something went wrong");
      this.heap
        .task(function(done){
          done( pass )
        })
        .fail(function(err){
          assert.instanceOf( err, Error )
          assert.deepEqual( err, pass, "err should match" )
          testDone();
        })
    })
    it( "should remove the listener after heap 'drained' event", function(testDone){
      var pass = Error("something went wrong")
        , catched = 0;
      ;
      this.heap
      .then(function(){
        throw pass;
      })
      .fail(function(err){
        assert.deepEqual( err, pass );
        catched++;
      })
      .then(function(){
        assert.equal(catched, 1, "error should be catched before")
        throw pass;
      })
      .on( 'error', function(err){
        assert.equal(catched, 1, "error should be catched only once")
        assert.deepEqual( err, pass, "error should match pass" );
        testDone()
      })
    })
  })

});
