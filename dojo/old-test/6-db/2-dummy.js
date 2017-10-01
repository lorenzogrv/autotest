var assert = require('chai').assert
  , iai = require('../..')
  , test = iai('test')
  , fs = require('fs')
  , DummyConnection = iai('db/dummy/DummyConnection')
  , filename = __dirname+'/test-db.dummy'
  , testOpts = {
      system: 'Dummy',
      file: filename
    }
;

describe('Dummy db management system', function(){
  describe('DummyConnection', function(){
    it("should be a builder", function(){
      test.builder( DummyConnection, [testOpts] );
    })
    describe("#open", function(){
      before(function(done){
        // create file for testing
        fs.open( filename, 'w+', function(err, fd){
          if(err) return done(err);
          fs.close(fd, done);
        })
      })
      beforeEach(function(){
        this.connection = DummyConnection(testOpts);
      })
      it("should callback a file descriptor", function(done){
        this.connection
          .open()
          .then(function(fd){
            assert.isNumber( fd, 'file descriptor should be a number' );
            assert( fd % Math.floor(fd) == 0, 'file descriptor should be a integer' );
          })
          .close()
          .then(done)
          .fail(done)
        ;
      })
      it("should fail if connection is already opened", function(testDone){
        var connection = this.connection;
        connection
          .open()
          .open()
          .fail(function(err){
            assert.equal( err.message, "connection already opened" )
            testDone()
            connection.close();
          })
        ;
      })
      it("should fail if file doesn't exist", function(testDone){
        fs.unlinkSync(filename);
        this.connection
          .open()
          .fail(function(err){
            assert.equal( err.code, 'ENOENT' )
            testDone();
          })
        ;
      })
    })
    describe("#close", function(){
      it("should be tested?")
    })
  })

  describe('DummyDAO', function(){
    it("should be tested?")
  })

})
