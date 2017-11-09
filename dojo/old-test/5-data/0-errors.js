var assert = require("chai").assert
  , iai = require("../..")
  , test = iai( "test" )
  , ValidationError = iai( "data/ValidationError" )
  , ValidationErrorList = iai( "data/ValidationErrorList" )
  , SchemaValidationError = iai( "data/SchemaValidationError" )
;

describe( "ValidationError", function(){
  it( "should be a function", function(){
    assert.isFunction( ValidationError );
  })
  it( "should return Error instances", function(){
    assert.instanceOf( ValidationError("message", "code"), Error )
  })
  it( "should return ValidationError instances", function(){
    assert.instanceOf( ValidationError("message", "code"), ValidationError );
  })
})

describe.skip( "ValidationErrorList", function(){
  it( "should be a function", function(){
    assert.isFunction( ValidationErrorList );
  })
  it( "should return Error instances", function(){
    assert.instanceOf( ValidationErrorList(), Error )
  })
  it( "should return ValidationError instances", function(){
    assert.instanceOf( ValidationErrorList(), ValidationError )
  })
  it.skip( "should return ValidationErrorList instances", function(){
    assert.instanceOf( ValidationErrorList(), ValidationErrorList );
  })
})

describe( "SchemaValidationError", function(){
  it( "should be a function", function(){
    assert.isFunction( SchemaValidationError );
  })
  it( "should return ValidationError instances", function(){
    assert.instanceOf( SchemaValidationError(), ValidationError )
  })
  it( "should return SchemaValidationError instances", function(){
    assert.instanceOf( SchemaValidationError(), SchemaValidationError );
  })
  it( "should have an errors property", function(){
    var err = SchemaValidationError();
    assert.isDefined( err.errors, "is defined" );
    assert.isObject( err.errors, "is object" );
  })
  describe( "#add", function(){
    it("should be a function", function(){
      var err = SchemaValidationError();
      assert.isFunction(err.add);
    })
    it("should add properties to the errors object", function(){
      var e1 = ValidationError("error1", "code")
        , e2 = ValidationError("error2", "code")
        , err = SchemaValidationError()
      ;
      err.add("field1", e1).add("field2", e2).add("field2", e1);
      assert.isDefined( err.errors.field1, "e1 defined" )
      assert.deepEqual( err.errors.field1, [e1], "e1 equality" )
      assert.isDefined( err.errors.field2, "e2 defined" )
      assert.deepEqual( err.errors.field2, [e2, e1], "e2 equality" )
    })
  })
})
