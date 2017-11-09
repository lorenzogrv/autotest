var assert = require("chai").assert
  , iai = require("../..")
  , test = iai( "test" )
  , ErrorBuilder = iai( "core/ErrorBuilder" )
  , ErrorList = iai( "core/ErrorList" )
;

describe( "ErrorBuilder", function(){
  it( "should be a function", function(){
    assert.isFunction( ErrorBuilder );
  })
  it( "should return Error instances", function(){
    assert.instanceOf( ErrorBuilder("check check"), Error )
  })
  it( "should return ErrorBuilder instances", function(){
    assert.instanceOf( ErrorBuilder("testing"), ErrorBuilder );
  })
  it( "should have a message property", function(){
    var msg = "something went wrong :S";
    assert.equal( ErrorBuilder(msg).message, msg );
  })
  it( "should have a stack property", function(){
    assert.isDefined( ErrorBuilder("check").stack );
  })
  it( "should have a name property being 'ErrorBuilder'", function(){
    assert.equal( ErrorBuilder("something").name, "ErrorBuilder" );
  })
  it( "should have a proper string representation", function(){
    var err = ErrorBuilder("Oops! Something went wrong :(");
    assert.equal( err.toString(), "ErrorBuilder: Oops! Something went wrong :(" )
  })
})

describe( "ErrorList", function(){
  it( "should be a function", function(){
    assert.isFunction( ErrorList );
  })
  it( "should return Error instances", function(){
    assert.instanceOf( ErrorList( ErrorBuilder ), Error )
  })
  it( "should return ErrorList instances", function(){
    assert.instanceOf( ErrorList( ErrorBuilder ), ErrorList );
  })
  it( "should return instances of given builder", function(){
    assert.instanceOf( ErrorList(TypeError), TypeError );
    assert.instanceOf( ErrorList(ReferenceError), ReferenceError );
  })
  it( "should have a message property being...", function(){
    assert.equal( ErrorList(ErrorBuilder).message, "There are some errors." );
  })
  it( "should have a stack property", function(){
    assert.isDefined( ErrorList(ErrorBuilder).stack );
  })
  it( "should have a name property being 'ErrorList'", function(){
    assert.equal( ErrorList(ErrorBuilder).name, "ErrorList" );
  })
  it( "should have a length property", function(){
    assert.equal( ErrorList(ErrorBuilder).length, 0 );
  })

  describe('#toArray', function(){
    it( "should be a function", function(){
      assert.isFunction( ErrorList(ErrorBuilder).toArray );
    })
    it( "should return an array", function(){
      assert.isArray( ErrorList(ErrorBuilder).toArray() );
    })
  })

  describe('#push', function(){
    it( "should be a function", function(){
      assert.isFunction( ErrorList(ErrorBuilder).push );
    })
    it( "should add a new errors", function(){
      var messages = [ "something happened", "foo", "bar" ]
        , copy = messages.slice(0)
        , list = ErrorList(ErrorBuilder)
        , n = 0
      ;
      while( copy.length ){
        list.push( ErrorBuilder(copy.shift()) )
        assert.equal( list[n].message, messages[n], "check"+n )
        n++;
      }
      assert.equal( list.length, messages.length, "lengths should match")
    })
    it( "should return the list instance", function(){
      var list = ErrorList(ErrorBuilder)
        , err = ErrorBuilder('test')
      ;
      assert.instanceOf( list.push(err), ErrorList );
      assert.deepEqual( list.push(err), list );
    });
    it( "should properly increment list.length", function(){
      var err = ErrorBuilder("testing")
        , list = ErrorList(ErrorBuilder)
      ;
      for( var x = 1; x < 10; x++ ){
        assert.equal( list.push(err).length, x, "iteration"+x );
      }
    })
  })

  describe('#pop', function(){
    it( "should be a function", function(){
      assert.isFunction( ErrorList(ErrorBuilder).pop );
    })
  })

  describe('#shift', function(){
    it( "should be a function", function(){
      assert.isFunction( ErrorList(ErrorBuilder).shift );
    })
  })

  describe('#unshift', function(){
    it( "should be a function", function(){
      assert.isFunction( ErrorList(ErrorBuilder).unshift );
    })
  })

  describe('#join', function(){
    it( "should be a function", function(){
      assert.isFunction( ErrorList(ErrorBuilder).join );
    })
  })

  describe('#map', function(){
    it( "should be a function", function(){
      assert.isFunction( ErrorList(ErrorBuilder).map );
    })
  })

  describe('#each', function(){
    it( "should be a function", function(){
      assert.isFunction( ErrorList(ErrorBuilder).each );
    })
  })

  describe("#toString", function(){
    it("should return 'ErrorList <BuilderName> (empty)' if list is empty", function(){
      var str = ErrorList(ErrorBuilder).toString();
      assert.equal( str, "ErrorList <ErrorBuilder> (empty) []" )
    })
    it("should return '<name>' plus errors line by line", function(){
      var messages = [ "something happened", "foo", "bar", "yeah!" ]
        , list = ErrorList(ErrorBuilder)

      ;
      while( messages.length ){
        var msg = messages.shift();
        list.push( ErrorBuilder(msg) )
      }
      assert.equal( list.toString(), "ErrorList <ErrorBuilder> (4) [ErrorBuilder: something happened, ErrorBuilder: foo, ErrorBuilder: bar, ErrorBuilder: yeah!]")
    })
  })
})
