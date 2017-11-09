var assert = require('chai').assert
  , iai = require('../..')
  , test = iai('test')
  , testOpts = { system: 'Dummy' }
  , Connection = iai('db/BaseConnection')
  , DAO = iai('db/BaseDAO')
  , Facade = iai('db/Facade')
;

describe( 'BaseConnection', function(){
  it( 'should be a builder', function(){
    test.builder( Connection )
  })
  it( 'should have the following chainable api', function(){
    console.log();
    test.chainableApi( Connection(), {
      'open': [],
      'close': []
    });
  })
})

describe( 'BaseDAO', function(){
  it( 'should be a builder', function(){
    test.builder( DAO, [testOpts] )
  })
  it( 'should have the following chainable api', function(){
    console.log();
    test.chainableApi( DAO(), {
      'create': [],
      'retrieve': [],
      'update': [],
      'destroy': []
    });
  })
})

describe( 'Facade', function(){
  it( 'should be a builder', function(){
    test.builder( Facade, [testOpts] )
  })
  it( 'should have the following chainable api', function(){
    test.chainableApi( Facade(testOpts), {
      'find': [],
      'findOne': [],
      'create': [], // findOrCreate?
      'update': [],
      'destroy': []
    });
  })
  describe( '#connection', function(){
    var facade = Facade(testOpts);
    it( 'should be a Connection instance', function(){
      assert( facade.connection instanceof Connection );
    })
  })
  describe( '#dao', function(){
    var facade = Facade(testOpts);
    it( 'should be a DAO instance', function(){
      assert( facade.dao instanceof DAO );
    })
  })
})
