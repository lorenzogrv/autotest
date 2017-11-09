var iai = require( '../..' )
  , assert = require( 'chai' ).assert
  , test = iai('test')
  , flow = iai( 'async/flow' )
;

describe('async/flow instances', function(){
  it('should be functions', function(){
    assert.isFunction( flow() );
  });
  describe('#stack', function(){
    it('should be an array', function(){
      assert.isArray( flow().stack );
    })
  })
  describe('#next', function(){
    it('should be a function', function(){
      assert.isFunction( flow().next );
    })
    it('should throw TypeError if first arg is not a function', function(){
      assert.throws(function(){
        flow().next();
      }, TypeError, /first arg must be a function/)
    })
    it('should return the flow instance', function(){
      var f = flow();
      assert.deepEqual( f.next(function(){}), f );
    })
    it('should push given function on the stack', function(){
      function foo(){}
      var f = flow().next(foo);
      assert.equal(f.stack.length, 1, "stack length should equal 1");
      assert.deepEqual(f.stack[0], foo, "function does not match");
    })
  });
  describe('#iterate', function(){
    it('should be a function', function(){
      assert.isFunction( flow().iterate );
    })
    it('should throw a TypeError if first arg is not present', function(){
      assert.throws(function(){
        flow().iterate();
      }, TypeError, /first arg must be present/)
    })
    it('should return an object', function(){
      var o = flow().iterate([]);
      assert.isObject(o, 'object not returned')
    })
    describe('returned object', function(){
      describe('#step', function(){
        it('should be a function', function(){
          assert.isFunction( flow().iterate([]).step );
        })
        it('should throw TypeError if first arg is not a function', function(){
          assert.throws(function(){
            flow().iterate([]).step();
          }, TypeError, /first arg must be a function/);
        })
        it('should throw TypeError if given function does not expect 3 args', function(){
          assert.throws(function(){
            flow().iterate([]).step(function(  ){});
          }, TypeError, /must expect exactly 3 arguments/, "0 arguments should throw");
          assert.throws(function(){
            flow().iterate([]).step(function( a ){});
          }, TypeError, /must expect exactly 3 arguments/, "1 argument should throw");
          assert.throws(function(){
            flow().iterate([]).step(function( a, b ){});
          }, TypeError, /must expect exactly 3 arguments/, "2 arguments should throw");
          assert.throws(function(){
            flow().iterate([]).step(function( a, b,c, d ){});
          }, TypeError, /must expect exactly 3 arguments/, "4 arguments should throw");
        })
        it('should return the flow instance', function(){
          var instance = flow();
          var returns = instance.iterate([]).step(function(a,b,c){});
          assert.deepEqual(returns, instance);
        })
        it('should push a function on the stack for each item given to iterate', function(){
          var stack = flow()
            .iterate( "abcde" )
            .step(function(a,b,c){})
            .stack
          ;
          assert.equal( stack.length, 5 );
          stack.forEach(function(val, key){
            assert.isFunction(val, "item with key '"+key+"' is not a function");
          })
        })
      })

    })
  })
  describe('#catcher', function(){
    it("should be useful to catch some errors without breaking the flow")
  })
  describe('#together', function(){
    it("should paralelize work through a worker function")
    it("should push a function on the stack")
    it("should return an object")
    describe("returned object", function(){
      it("#worker")
    })
  })
  describe('when executed', function(){
    it('should sequentially call each function on the stack');
  })
});
