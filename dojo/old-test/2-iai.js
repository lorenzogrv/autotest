
var assert = require( "chai" ).assert
  , iai = require( ".." )
  , test = require("iai-test")
;

describe( "the iai function", function(){

  it("should have the following methods", function(){
    test.methods( iai, 'load', 'app' );
  })

  describe( "#load", function(){
    it( "should require the given path relative to the iai lib path", function(){
      assert.deepEqual( iai.load( "utils/inspector" ), require( "../lib/utils/inspector" ) );
    })
  })

  describe( "given a relative path", function(){
    it( "should delegate on iai.load", function(){
      var cases = [
        "utils/inspector",
        "./utils/inspector",
        "../lib/utils/inspector"
      ];
      for( var i in cases ) {
        assert.deepEqual( iai(cases[i]), iai.load(cases[i]) );
      }
    })
  })

  describe( "given an absolute path", function(){
    it( "should return a component", function(){
      assert.deepEqual( iai(__dirname), iai('core/Component')(__dirname) )
    })
  })

  describe( "given a module object", function(){
    it( "should return a loader function", function(){
      assert.equal( iai(module).toString(), iai('loader')(module) );
    })
  })

  describe.skip( "#app", function(){
    it( "should return an instance of core/Application", function(){
      var app = iai.app();
      assert.instanceOf( iai.app(), iai("core/Application") );
    })
  })

  describe( "#toString", function(){
    it( "should return an proper representation", function(){;
      assert.equal( iai+"", "[iai Function]" );
    })
  })
})

describe.skip( "iai.api instances", function(){
  beforeEach(function(){
    this.api = iai.api( __dirname );
  })

  it( "should implement the notifier api", function(){
    test.notifierApi( this.api );
  })

  it( "should have the following chainable api", function(){
    test.chainableApi( this.api, {
      "task": [ function( done ){} ],
      "mount": [ function plugin(callback){} ]
    });
  })

  describe( "#task", function(){
    it( "should execute given task if none tasks added yet", function(done){
      this.api.task(function(callback){
        done();
      })
    })
    it("should execute the task function as expected", function(done){
      var api = this.api.task(function(callback){
        assert.deepEqual( this, api, "context is not the current api" )
        assert.isFunction( callback, "callback is not a function" )
        done();
      })
    })
    it( "should emit the error passed to callback", function(done){
      var pass = Error("Oops!");
      this.api.task(function(callback){
        callback( pass );
      }).on( 'error', function(err){
        assert.deepEqual( err, pass );
        done();
      })
    })
    it( "should skip all tasks if callback receives error", function(done){
      var pass = Error( "something happened" )
      this.api
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
      this.api
      .task(function(callback){
        throw oops;
      })
      .on('error', function(err){
        assert.deepEqual( err, oops );
        done();
      })
    })
  })

  describe( "#mount", function(){
    it( "should throw a TypeError if", function(){
      var cases = {
        "an empty string": "",
        "undefined": "".undefined_property,
        "null": null,
        "a Number": 456,
        "an Array": [ 1, 50, 'foo', { a: 2 } ],
        "an Object": { a: 1, b: 2, c: [1, 2, 3] },
        "an anonymous function without callback": function(){},
        "an anonymous function with callback": function(callback){},
        "a named function without callback": function name(){}
      };
      for( var name in cases ){
        assert.throws( (function(){
          this.api.mount( cases[ name ] )
        }).bind(this), TypeError, /.*/, "given "+name )
      }
    })
    it( "should not execute generator if there are tasks on the heap", function(done){
      this.api.task(function(callback){
        setTimeout(done, 20);
      }).mount(function generator(callback){
        done( Error( "this should not be called") );
      });
    })
    it( "should execute generator as expected", function(done){
      var api = this.api.mount(function generator(callback){
        assert.deepEqual( this, api, "context is not the iai api" );
        assert.isFunction( callback, "callback is not a function" )
        done();
      })
    })
    it( "should emit errors given to the callback", function(done){
      var pass = Error("Oops!");
      this.api.mount(function generator(callback){
        callback( pass );
      }).on( 'error', function(err){
        assert.deepEqual( err, pass );
        done()
      })
    })
    it( "should throw error given a non-error as callback 1st arg", function(){
      this.api.mount(function generator(callback){
        assert.throws(function(){
          callback( "not an error" );
        }, TypeError, /callback expects first arg to be an Error/);
      });
    })
    it( "should properly store the callback 2nd arg", function(done){
      var pass = "i am a very a cool plugin";
      this.api.mount(function generator(callback){
        callback( null, pass )
      }).task(function(cb){
        var prop = test.defined( this, "generator" );
        assert.isTrue( prop.enumerable, "plugin should be enumerable" );
        assert.isFalse( prop.configurable, "plugin should not be enumerable" );
        assert.isFalse( prop.writable, "plugin should not be writable" );
        assert.deepEqual( pass, prop.value, "bad plugin value");
        done();
      })
    })
    it( "should throw an error if plugin already mounted", function(done){
      var pass = "i am a very a cool plugin";
      function generator(callback){
        callback( null, pass )
      }
      this.api
      .mount( generator )
      .task(function(cb){
        assert.deepEqual( this.generator, pass );
        cb();
      })
      .mount( generator )
      .task(function(cb){
        done( Error("this should not be executed") );
      })
      .on( 'error', function(err){
        assert.match( err, /plugin \[generator\] already mounted/);
        done();
      })
    })
  })

  describe( "#resolve", function(){
    it( "should be a function", function(){
      assert.isFunction( this.api.resolve );
    })
    it( "should resolve the given path based on api's root", function(){
      assert.equal( this.api.resolve("."), __dirname )
    })
  })

});





























