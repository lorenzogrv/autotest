var oop = require('iai-oop')
  , fs = require('fs')
  , Parent = require( '../BaseConnection' )
;

var exports = module.exports = oop.builder(function(opts){
  return oop( Parent.call(this) )
    .visible( 'file', opts.file )
    .set( 'fd', null )
    .o
  ;
}, Parent.prototype, {
  open: function(){
     return this
       .task(function(done){
         if( this.fd ){
           return done( Error('connection already opened') );
         }
         fs.open( this.file, 'r+', done );
       })
       .task(function( done, fd ){
         done( null, this.fd = fd );
       })
     ;
  },
  close: function(){
    return this
      .task(function(done){
        if( this.fd === null ){
          return done( Error('connection already closed') );
        }
        fs.close( this.fd, done )
      })
      .then(function(){
        this.fd = null;
      })
    ;
  },
  toString: function(){
    return "[object DummyConnection]";
  }
})

exports.version = "0";
exports.stability = 1;
