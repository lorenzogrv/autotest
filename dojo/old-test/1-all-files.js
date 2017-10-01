var assert = require( "chai" ).assert
  , path = require( "path" )
  , join = path.join
  , format = require( "util" ).format
  , extname = path.extname
  , iai = require( "../" )
  , accesible_from = {
      "the iai function": iai,
      "iai.load": iai.load
  }
  , should_export = {
      "not an empty object": function( topic ){
        if(
          'function' == typeof topic
          // || 'string == typeof topic
        ){
          return "skip checking for empty object";
        }
        assert.isFalse( isEmptyObject(topic) );
      }
      /*,"a function object": function( topic ) {
          assert.isFunction( topic );
      }
      ,"a name string": function( topic ) {
          assert.isString( topic.name );
      }
      ,"a version string": function( topic ) {
        assert.isString( topic.version );
      }
      ,"a stability number between 0 and 5": function( topic ) {
        assert.isNumber( topic.stability );
        assert.include( [0, 1, 2, 3, 4, 5], topic.stability )
      }*/
  }
;

function isEmptyObject( o ){
  for( var n in o ){
    return true;
  }
  return false;
}

var libRoot = join( __dirname, "..", "lib" )
  , file = require( "file" )
;

file.walkSync( libRoot, function( dirPath, dirs, files ) {
  files.forEach(function( filepath ){
    if( path.extname(filepath) != '.js' ){
      return;
    }
    filepath = path.join( dirPath, filepath );
    var relativePath = path.relative( libRoot, filepath );
    describe( "the file "+relativePath, function() {

      var something;
      it( "should be required without throwing errors", function() {
        something = require( filepath )
      });

      var modname = relativePath.replace( path.extname( relativePath ), "" );

      for( var key in accesible_from ) {
        it(
          format( "should be accesible from %s as %s", key, modname )
          , function(){
            assert.deepEqual( something, accesible_from[ key ]( modname ) );
          });
      }

      Object.keys(should_export).forEach(function( desc ){
        it( "should export "+desc, function(){
          should_export[ desc ]( something );
        });
      })
    });
  })
});







