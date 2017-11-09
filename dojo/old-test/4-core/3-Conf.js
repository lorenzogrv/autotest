var assert = require("chai").assert
  , iai = require("../..")
  , test = iai( "test" )
  , Conf = iai( "core/Conf" )
;

describe( "Conf", function(){
  it("should be accesible through iai.conf", function(){
    assert.deepEqual( iai.conf(), Conf );
    assert.deepEqual( iai.conf(), Conf(), "extra call check" );
  })

  describe("#register", function(){
    it("should fail if validator function is not provided", function(){
      assert.throws(function(){
        Conf.register('test.register.fail')
      }, TypeError, /validator function/ )
    })

    it("should fail if default value does not satisfy validator", function(){
      assert.throws(function(){
        Conf.register('test.register.string', true, Conf.types.str );
      }, TypeError, /must pass validator function/ )
    })

    it("should not register keys when fails", function(){
      assert.throws(function(){
        Conf.get('test.register.fail')
      }, ReferenceError, /not registered/ )
    })

    it("should register keys when succeeds", function(){
      Conf.register( 'test.register.string', 'something', Conf.types.str );
      Conf.register( 'test.register.bool', false, Conf.types.bool );

      assert.isFalse( Conf.get('test.register.bool') );
      assert.equal( Conf.get('test.register.string'), 'something' );
    })

    it("should return Conf to allow chains", function(){
      var r = Conf.register( 'test.register.returns', true, Conf.types.bool );
      assert.deepEqual( r, Conf );
    })
  })

  describe("#get", function(){
    it("should fail given unexistent key", function(){
      assert.throws(function(){
        Conf.get('test.get.unexistent')
      }, ReferenceError, /not registered/);
    })
  })

  describe("#set", function(){
    it("should fail given unexistent key", function(){
      assert.throws(function(){
        Conf.set('test.set.unexistent')
      }, ReferenceError, /not registered/);
    })

    it("should fail if value does not satisfy validator", function(){
      Conf.register( 'set.bool', false, Conf.types.bool );

      assert.throws(function(){
        Conf.set( 'set.bool', "something not valid" );
      }, TypeError, /must satisfy validator/);
    })

    it("should change value if succeed", function(){
      assert.isFalse( Conf('set.bool') );
      Conf.set( 'set.bool', true );
      assert.isTrue( Conf('set.bool') );
    })
  })

  describe("#reset", function(){
    it("should fail given unexistent key", function(){
      assert.throws(function(){
        Conf.reset('test.reset.unexistent')
      }, ReferenceError, /not registered/);
    })

    it("should rollback key value to default", function(){
      Conf.register( 'reset.test', 'default value', Conf.types.str );
      assert.equal( Conf('reset.test'), 'default value' );

      Conf.set( 'reset.test', 'override value' )
      assert.equal( Conf('reset.test'), 'override value' );

      Conf.reset( 'reset.test' );
      assert.equal( Conf('reset.test'), 'default value' );
    })
  })

  describe("#enable", function(){
    it("should fail given unexistent key", function(){
      assert.throws(function(){
        Conf.enable('enable.unexistent')
      }, ReferenceError, /not registered/);
    })

    it("should fail for non-boolean values", function(){
      Conf.register( 'enable.str', 'foo', Conf.types.str );
      assert.throws(function(){
        Conf.enable( 'enable.str' );
      }, TypeError, /only boolean values/)
    })

    it("should set to true any boolean key-value pair", function(){
      Conf
        .register( 'enable.bool', false, Conf.types.bool )
        .enable( 'enable.bool' )
      ;
      assert.isTrue( Conf('enable.bool') );
    })
  })

  describe("#disable", function(){
    it("should fail given unexistent key", function(){
      assert.throws(function(){
        Conf.disable('disable.unexistent')
      }, ReferenceError, /not registered/);
    })

    it("should fail for non-boolean values", function(){
      Conf.register( 'disable.str', 'foo', Conf.types.str );
      assert.throws(function(){
        Conf.disable( 'disable.str' );
      }, TypeError, /only boolean values/)
    })

    it("should set to false any boolean key-value pair", function(){
      Conf
        .register( 'disable.bool', false, Conf.types.bool )
        .enable( 'disable.bool' )
      ;
      assert.isTrue( Conf('enable.bool') );
    })
  })
})
