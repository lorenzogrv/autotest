var oop = require('iai-oop')
  , Parent = require( '../BaseConnection' )
;

try {
  var sqlite3 = require( 'sqlite3' );
} catch(err) {
  throw Error("iai SQLite model relies on 'sqlite3' npm package, please install it");
}

var exports = module.exports = oop.builder(function(opts){
  return oop( Parent.call(this) )
    .visible( 'opts', opts )
    .set( 'db', null )
    .o
  ;
}, Parent.prototype, {
  open: function(){
     return this
       .task(function(done){
         if( this.db ){
           return done( Error('connection already opened') );
         }
         var file = this.opts.file;
         new sqlite3.cached.Database(
           this.opts.file,
           this.opts.mode || ( sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE ),
           function( err ){
             if( err ){
               // clear cache to avoid problems...
               delete sqlite3.cached.objects[file];
               return done(err)
             }
             done( null, this );
           }
         );
       })
       .task(function( done, db ){
         done( null, this.db = db );
       })
     ;
  },
  close: function(){
    return this
      .task(function(done){
        if( this.db === null ){
          return done( Error('connection already closed') );
        }
        this.db.close( done );
      })
      .then(function(){
        this.db = null;
      })
    ;
  },
  toString: function(){
    return "[object SQLiteConnection]";
  }
})

exports.version = "1";
exports.stability = 2;
