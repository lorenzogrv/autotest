var iai = require( '../..' )
  , test = require( 'iai-test' )
  , assert = require( 'chai' ).assert
  , Notifier = iai( 'async/Notifier' )
;

describe( "Notifier", function(){
      beforeEach(function(){
        this.case = Notifier();
      })
      it( "should define the followin chainable api", function(){
        test.chainableApi( this.case, {
          emit: ["event"],
          on: ["event", function(){}],
          once: ["event", function(){}]
        });
      })
      describe( "#emit", function(){
        it( "should call 'on' listeners preserving the args", function(done){
          this.case.on( 'test', function( a1, a2 ){
            assert.equal( a1, 1, "argument 1 preserved" )
            assert.equal( a2, "something", "argument 2 preserved" )
            done()
          }).emit( 'test', 1, 'something' );
        })
        it( "should call 'on' listeners multiple times", function(done){
          var count = 0;
          this.case.on( 'test', function(){
              if( count > 5 ) return done();
              count++;
              this.emit( 'test' )
          }).emit( 'test' );
        })
        it( "should call 'once' listeners only once", function(done){
          this.case.once( 'test', function(){
            // will call done 2 times if not ok
            done()
          }).emit( 'test' ).emit( 'test' )
        })
        it( "should throw an emitted error if no error listerners bound", function(){
          var q = this.case;
          assert.throws(function(){
            q.emit( 'error', Error("something happened") )
          }, /something happened/)
        })
        it( "should not throw errors when catched by listeners", function(done){
          this.case
          .on( 'error', function(err){
            if( err.message=="secret" ){
              return done();
            }
            done( Error( "this was not expected") )
          })
          .emit( 'error', Error("secret") )
        })
      })
      describe( "#on", function(){
        it( "should delegate on #notifier.on preserving the args", function(done){
          this.case
            .on( 'test', done )
            .emit( 'test' )
          ;
        })
      })
      describe( "#once", function(){
        it( "should delegate on #notifier.once preserving the args", function(done){
          this.case
            .once( 'test', done )
            .emit( 'test' )
          ;
        })
      })
    })
