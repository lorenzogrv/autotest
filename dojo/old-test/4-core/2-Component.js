var assert = require("chai").assert
  , iai = require("../..")
  , test = iai( "test" )
  , Component = iai( "core/Component" )
;

describe( "Component", function(){
  it( "should be a builder", function(){
    test.builder( Component, [__dirname] );
  })
  it( "should return instances of Notifier", function(){
    assert.instanceOf( Component(__dirname), iai('async/Notifier') );
  })
  it( "should preserve a cache of registered components", function(){
    test.defined( Component, 'components' );
    assert.instanceOf( Component.components[__dirname], Component );
  })
})

describe( "Component instances", function(){
  var component = Component(__dirname);
  it( "should have the following methods", function(){
    test.methods( component, "resolve", "require" );
  })
  describe( "#resolve", function(){
    it( "should resolve given path relative to component's path", function(){
      assert.equal( component.resolve( "foo" ), __dirname + '/foo' );
    })
    it( "should fully resolve relativeness", function(){
      assert.equal( component.resolve( "foo/bar" ), __dirname + '/foo/bar' );
      assert.equal( component.resolve( "foo/.." ), __dirname );
      assert.equal( component.resolve( "foo/bar/../." ), __dirname + '/foo' );
    })
    it( "should admit multiple arguments as path.resolve does", function(){
      assert.equal( component.resolve( "foo", "bar" ), __dirname + '/foo/bar' );
      assert.equal( component.resolve( "foo", "../bar" ), __dirname + '/bar' );
      assert.equal( component.resolve( "foo", "..", "bar" ), __dirname + '/bar' );
    })
  })
  describe( "#require", function(){
    it( "should require modules relativelly to component's path", function(){
      assert.deepEqual( component.require( '1-errors' ),
                        require( __dirname + '/1-errors' ) )
    })
  })
})
