var assert = require('chai').assert
  , iai = require('../..')
  , test = iai('test')
  , fields = iai('data/fields')
  , Schema = iai('data/Schema')
  , SchemaValidationError = iai('data/SchemaValidationError')
;

describe( 'Schema', function(){
  it( 'should be a builder', function(){
    test.builder( Schema, [] );
  })
  it( 'should have the following chainable api', function(){
    test.chainableApi( Schema(), {
      'addField': [ 'some_name', iai('data/Field')() ], // composite 'add'
      'addFields': [ {} ], // multiple composite 'add'
    })
  })
  it.skip( 'should validate as expected', function(done){
    var schema = Schema( 'testing-schema', {
      id: iai('data/Field')({ unique: true }),
      name: fields('Text')({ max_length: 30 }),
      email: fields('Text')({  }),
      password: fields('Text')({ encrypt: "sha1", min_length: 6 })
    });

    schema.validate( {}, function(err, cleaned){
      console.dir( err );
      assert.instanceOf( err, SchemaValidationError, "error should be present" );
      assert.isNull( cleaned, "cleaned data should be null when failed" );

      assert.equal( err.code, "invalid_schema" )

      assert.equal( err.errors.id.length, 1, "id error count not ok" );
      assert.equal( err.errors.id[0].code, "empty", "id error code not ok" );

      assert.equal( err.errors.name.length, 1, "name error count not ok" );
      assert.equal( err.errors.name[0].code, "string", "name error code not ok" );

      assert.equal( err.errors.email.length, 1, "email error count not ok" );
      assert.equal( err.errors.email[0].code, "string", "email error code not ok" );

      assert.equal( err.errors.password.length, 1, "password error count not ok" );
      assert.equal( err.errors.password[0].code, "string", "password error code not ok" );

      done();
    });
  })
})
