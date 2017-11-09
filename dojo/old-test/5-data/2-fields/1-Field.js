var assert = require('chai').assert
  , iai = require('iai')
  , test = iai('test')
  , Field = iai('data/Field')
  , fields = iai('data/fields')
  , ValidationError = iai('data/ValidationError')
;

describe( 'Field', function(){
  it( 'should be a builder', function(){
    test.builder( Field, [] );
  })
  it( 'should return instances of Data', function(){
    assert.instanceOf( Field(), iai('data/Data') )
  })
  it( 'should have a proper string representation', function(){
    assert.equal( Field()+'', '<Field []>' )
    assert.equal( Field({ blank: 1 })+'', '<Field [blank]>' )
    assert.equal( Field({ unique: 1 })+'', '<Field [unique]>' )
    assert.equal( Field({ blank: 1, unique: 1 })+'', '<Field [blank, unique]>' )
  })

  describe('blank feature', function(){
    it("should be disabled by default", function(){
      var field = Field();
      assert.isFalse( field.blank )
    })
    it("should be enabled if desired", function(){
      var field = Field({ blank: true });
      assert.isTrue( field.blank )
    })

    var filled = [ "something", { a: 1 }, [1,2], new Date() ]
      , empty = ["", [], {}, undefined, null ]
    ;

    describe("when enabled", function(){
      var field = Field({ blank: true });
      empty.concat(filled).forEach(function(val){
        it("should validate successfully '"+val+"'", function(done){
          field.validate(val, function(err, cleaned){
            assert.isNull(err, "bar error for"+val);
            assert.deepEqual(cleaned, val, "bad data for"+val);
            done()
          })
        })
      })
    })
    describe("when disabled", function(done){
      var field = Field();
      filled.forEach(function(val){
        it("should validate successfully '"+val+"'", function(done){
          field.validate(val, function(err, cleaned){
            assert.isNull(err, "bar error for"+val);
            assert.deepEqual(cleaned, val, "bad data for"+val);
            done()
          })
        })
      })
      empty.forEach(function(val){
        it("should fail validating '"+val+"'", function(done){
          field.validate(val, function(err, cleaned){
            assert.instanceOf(err, ValidationError, "bar error");
            assert.isNull(cleaned, "bad data");
            done();
          })
        })
      })
    })
  })
})
