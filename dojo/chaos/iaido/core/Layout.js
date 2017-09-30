var iai = require('iai')
  , oop = iai('oop')
;


/**
 * @builder Layout
 * @param output: a WritableStream instance
 */

module.exports = oop.builder(function layout( output ){
  return oop.create( this )
    .visible( 'out', output )
    .o
  ;
}, {
  write: function( text ){
    this.out.write( text+'\n', 'utf8' );
    return this;
  },
  render: function( content ){
    this.out.setHeader(' Content-Type', 'text/plain; charset=utf-8' )
    this
      .write( '# Something happened #' )
      .write( '' )
      .write( '(o_o)?' )
      .write( '' )
      .write( content )
    ;
    this.out.end();
  }
})

module.exports.version = "0.1";
module.exports.stability = 1;
