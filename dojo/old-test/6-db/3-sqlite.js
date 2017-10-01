var assert = require('chai').assert
  , iai = require('../..')
  , test = iai('test')
  , Connection = iai('db/sqlite/SQLiteConnection')
  , SQLite3Database = require('sqlite3').Database
  , testOpts = {
      system: 'SQLite',
      file: ''
    }
;

describe('SQLite db management system', function(){
  describe('SQLiteConnection', function(){
    it("should be a builder", function(){
      test.builder( Connection, [testOpts] );
    })
    describe("#open", function(){
      it("should callback a SQLite3 database", function(done){
        Connection(testOpts)
          .open()
          .then(function(db){
            assert.instanceOf( db, SQLite3Database, "instanceof check" );
          })
          .close()
          .then(done)
          .fail(done)
        ;
      })
      it("should fail if connection is already opened", function(testDone){
        var connection = Connection(testOpts)
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
        Connection({ file: '/something/that/doesnt/exist' })
          .open()
          .then(function(){
            testDone( Error("open should fail") )
          })
          .fail(function(err){
            assert.equal( err.code, 'SQLITE_CANTOPEN' )
            testDone();
          })
        ;
      })
    })
    describe("#close", function(){
      it("should be tested?")
    })
  })

  describe('SQLiteDAO', function(){
    it("should be tested?")
  })

})
