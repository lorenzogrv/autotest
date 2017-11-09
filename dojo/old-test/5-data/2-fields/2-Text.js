var assert = require('chai').assert
  , iai = require('iai')
  , test = iai('test')
  , Text = iai('data/fields/Text')
  , ValidationError = iai('data/ValidationError')
;

describe( 'TextField', function(){
  it( 'should be a builder', function(){
    test.builder( Text, [] );
  })
  it( 'should return instances of Field', function(){
    assert.instanceOf( Text(), iai('data/Field') )
  })
  it( 'should have a proper string representation', function(){
    assert.equal( Text()+'', '<TextField []>')
    assert.equal( Text({ blank: 1 })+'', '<TextField [blank]>' )
    assert.equal( Text({ unique: 1 })+'', '<TextField [unique]>' )
    assert.equal( Text({ blank: 1, unique: 1 })+'', '<TextField [blank, unique]>' )
    assert.equal( Text({ max_length: 14 })+'', '<TextField [max_length=14]>' )
    assert.equal( Text({ min_length: 5 })+'', '<TextField [min_length=5]>' )
    assert.equal( Text({ blank: 1, min_length: 5 })+'',
                 '<TextField [blank, min_length=5]>' )
    assert.equal( Text({ blank: 1, max_length: 56 })+'',
                 '<TextField [blank, max_length=56]>' )
    assert.equal( Text({ blank: 1, unique:1, max_length: 56, min_length: 43 })+'',
                 '<TextField [blank, unique, max_length=56, min_length=43]>' )
  })

  describe('max_length feature', function(){
    it("should be disabled by default", function(){
      var field = Text();
      assert.isFalse( field.max_length )
    })
    it("should be enabled if desired", function(){
      var field = Text({ max_length: 13 });
      assert.equal( field.max_length, 13 );
    })
    it("should be enabled if zero", function(){
      var field = Text({ max_length: 0 });
      assert.equal( field.max_length, 0 );
    })


    describe("when set to 14", function(){
      var field = Text({ max_length: 14 })
      it("should successfully validate an string with 14 characters", function(done){
        field.validate("12345678901234", function(err, data){
          assert.isNull(err, "bad error");
          assert.equal(data, "12345678901234", "bad data");
          done()
        })
      })
      it("should fail validating an string with 15 characters", function(done){
        field.validate("123456789012345", function(err, data){
          assert.instanceOf(err, ValidationError, "bad error");
          assert.isNull(data, "bad data");
          done()
        })
      })
      it("should fail validating an string with 0 characters", function(done){
        field.validate("", function(err, data){
          assert.instanceOf(err, ValidationError, "bad error");
          assert.isNull(data, "bad data");
          done()
        })
      })
    })
    describe("when set to 0 and blank is enabled", function(done){
       var field = Text({ max_length: 0, blank: 1 })
       it("should fail validating an string with 14 characters", function(done){
         field.validate("12345678901234", function(err, data){
           assert.instanceOf(err, ValidationError, "bad error");
           assert.isNull(data, "bad data");
           done()
         })
       })
       it("should success validating an string with 0 characters", function(done){
         field.validate("", function(err, data){
           assert.isNull(err, "bad error");
           assert.equal(data, "", "bad data");
           done()
         })
       })
    })
  })
  describe('min_length feature', function(){
    it("should be disabled by default", function(){
      var field = Text();
      assert.isFalse( field.min_length )
    })
    it("should be enabled if desired", function(){
      var field = Text({ min_length: 13 });
      assert.equal( field.min_length, 13 );
    })
    it("should be enabled if zero", function(){
      var field = Text({ min_length: 0 });
      assert.equal( field.min_length, 0 );
    })
    describe("when set to 14", function(){
      var field = Text({ min_length: 14 })
      it("should successfully validate an string with 14 characters", function(done){
        field.validate("12345678901234", function(err, data){
          assert.isNull(err, "bad error");
          assert.equal(data, "12345678901234", "bad data");
          done()
        })
      })
      it("should fail validating an string with 13 characters", function(done){
        field.validate("1234567890123", function(err, data){
          assert.instanceOf(err, ValidationError, "bad error");
          assert.isNull(data, "bad data");
          done()
        })
      })
      it("should success validating an string with 15 characters", function(done){
        field.validate("123456789012345", function(err, data){
          assert.isNull(err, "bad error");
          assert.equal(data, "123456789012345", "bad data");
          done()
        })
      })
    })
  })
})
